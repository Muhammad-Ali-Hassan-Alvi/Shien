import crypto from "crypto";

function envFirst(...keys) {
    for (const key of keys) {
        const v = process.env[key];
        if (v) return v;
    }
    return "";
}

/** Online payments (PayFast) — off for v1; set ONLINE_PAYMENTS_ENABLED=true to enable */
export function isOnlinePaymentsEnabled() {
    return process.env.ONLINE_PAYMENTS_ENABLED === "true";
}

export function isPayFastConfigured() {
    if (!isOnlinePaymentsEnabled()) return false;
    const merchantId = envFirst("GOPAYFAST_MERCHANT_ID", "PAYFAST_MERCHANT_ID");
    const securedKey = envFirst("GOPAYFAST_SECURED_KEY", "PAYFAST_SECURED_KEY");
    return Boolean(merchantId && securedKey);
}

export function getAppBaseUrl() {
    return (
        envFirst("NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SITE_URL", "AUTH_URL", "SITE_URL") ||
        "http://localhost:3000"
    ).replace(/\/$/, "");
}

function getMode() {
    return (process.env.GOPAYFAST_MODE || process.env.PAYFAST_MODE || "sandbox").toLowerCase();
}

function getMerchantId() {
    return envFirst("GOPAYFAST_MERCHANT_ID", "PAYFAST_MERCHANT_ID");
}

function getSecuredKey() {
    return envFirst("GOPAYFAST_SECURED_KEY", "PAYFAST_SECURED_KEY");
}

function getMerchantName() {
    return envFirst("GOPAYFAST_MERCHANT_NAME", "PAYFAST_MERCHANT_NAME") || "iMART";
}

/** Token API base (no trailing slash). Override per PayFast dashboard. */
function getApiBaseUrl() {
    const custom = envFirst("GOPAYFAST_API_BASE_URL", "GOPAYFAST_BASE_URL", "PAYFAST_BASE_URL");
    if (custom) return custom.replace(/\/$/, "");

    return getMode() === "production"
        ? "https://ipg.apps.net.pk/Ecommerce/api/Transaction"
        : "https://ipguat.apps.net.pk/Ecommerce/api/Transaction";
}

function getTokenUrl() {
    const override = process.env.GOPAYFAST_TOKEN_URL;
    if (override) return override;
    const base = getApiBaseUrl();
    if (base.includes("gopayfast.com") || base.includes("/v1")) {
        return `${base}/token`;
    }
    return `${base}/GetAccessToken`;
}

/** Hosted checkout form POST URL */
export function getCheckoutPostUrl() {
    const override = process.env.GOPAYFAST_CHECKOUT_URL;
    if (override) return override;

    const base = getApiBaseUrl();
    if (base.includes("gopayfast.com")) {
        return `${base.replace(/\/v1$/, "")}/checkout`;
    }
    return `${base}/PostTransaction`;
}

/** Optional JSON initiate-payment API (some merchant docs) */
function getInitiatePaymentUrl() {
    const base = envFirst("GOPAYFAST_INITIATE_URL", "PAYFAST_BASE_URL") || "https://gopayfast.com";
    return `${base.replace(/\/$/, "")}/initiate-payment`;
}

export function buildPaymentSignature({ merchantId, merchantName, amount, basketId }) {
    const raw = `${merchantId}:${merchantName}:${amount}:${basketId}`;
    return crypto.createHash("md5").update(raw).digest("hex");
}

export function verifyPaymentSignature({ signature, merchantId, merchantName, amount, basketId }) {
    if (!signature) return false;
    const expected = buildPaymentSignature({ merchantId, merchantName, amount, basketId });
    return signature.toLowerCase() === expected.toLowerCase();
}

export async function fetchPayFastAccessToken(customerIp = "127.0.0.1") {
    const merchantId = getMerchantId();
    const securedKey = getSecuredKey();

    const params = new URLSearchParams();
    params.append("merchant_id", merchantId);
    params.append("secured_key", securedKey);
    params.append("grant_type", "client_credentials");
    params.append("customer_ip", customerIp);

    const res = await fetch(getTokenUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
        },
        body: params,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to get PayFast token");
    }

    const token = data.token || data.data?.token;
    const code = data.code ?? data.data?.code;

    if (!token) {
        throw new Error(data.message || "PayFast token missing in response");
    }

    if (code && code !== "00" && code !== 0 && code !== "0") {
        throw new Error(data.message || `PayFast token error (code ${code})`);
    }

    return token;
}

/**
 * Hosted checkout: returns URL + form fields for browser POST to PayFast.
 */
export async function buildHostedCheckout({ order, customerEmail, customerMobile, customerIp }) {
    const merchantId = getMerchantId();
    const merchantName = getMerchantName();
    const basketId = String(order._id);
    const amount = Number(order.totalAmount);
    const token = await fetchPayFastAccessToken(customerIp);

    const signature = buildPaymentSignature({
        merchantId,
        merchantName,
        amount,
        basketId,
    });

    const baseUrl = getAppBaseUrl();
    const backendCallback = `signature=${signature}&order_id=${encodeURIComponent(basketId)}`;

    const fields = {
        MERCHANT_ID: merchantId,
        MERCHANT_NAME: merchantName,
        TOKEN: token,
        PROCCODE: "00",
        TXNAMT: String(amount),
        CUSTOMER_MOBILE_NO: customerMobile,
        CUSTOMER_EMAIL_ADDRESS: customerEmail || "",
        SIGNATURE: signature,
        VERSION: "IMART-NEXTJS-1.0",
        TXNDESC: `Order ${basketId.slice(-8).toUpperCase()} — iMART`,
        SUCCESS_URL: encodeURIComponent(`${baseUrl}/checkout/success`),
        FAILURE_URL: encodeURIComponent(`${baseUrl}/checkout/failure`),
        BASKET_ID: basketId,
        ORDER_DATE: new Date().toISOString().slice(0, 19).replace("T", " "),
        CHECKOUT_URL: encodeURIComponent(backendCallback),
    };

    return {
        checkoutUrl: getCheckoutPostUrl(),
        fields,
        basketId,
        signature,
    };
}

/**
 * Alternate flow from merchant docs: JSON initiate-payment + redirect URL.
 * Enable with GOPAYFAST_USE_SIMPLE_API=true
 */
export async function buildSimpleCheckoutRedirect({
    order,
    customerEmail,
    customerMobile,
}) {
    const merchantId = getMerchantId();
    const securedKey = getSecuredKey();
    const basketId = String(order._id);
    const amount = Number(order.totalAmount);
    const merchantTxnId = `TXN-${basketId.slice(-8)}-${Date.now()}`;

    const hashString = `${merchantId}${merchantTxnId}${amount}${securedKey}`;
    const secureHash = crypto.createHash("md5").update(hashString).digest("hex");

    const baseUrl = getAppBaseUrl();
    const payload = {
        merchant_id: merchantId,
        merchant_txn_id: merchantTxnId,
        amount: String(amount),
        currency_code: "PKR",
        return_url: `${baseUrl}/checkout/success`,
        customer_email: customerEmail,
        customer_mobile: customerMobile,
        customer_name: order.shippingInfo?.fullName || "",
        secure_hash: secureHash,
    };

    const res = await fetch(getInitiatePaymentUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "PayFast payment initialization failed");
    }

    return {
        redirectUrl: data.redirect_url,
        merchantTxnId,
    };
}

export function useSimpleCheckoutApi() {
    return process.env.GOPAYFAST_USE_SIMPLE_API === "true";
}
