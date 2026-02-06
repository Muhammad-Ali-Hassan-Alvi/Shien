
const BASE_URL = process.env.GOPAYFAST_BASE_URL || "https://api.gopayfast.com/v1"; // Example URL, user didn't provide base
const MERCHANT_ID = process.env.GOPAYFAST_MERCHANT_ID;
const SECURED_KEY = process.env.GOPAYFAST_SECURED_KEY;

/**
 * Get Access Token
 */
export async function getAccessToken() {
    const params = new URLSearchParams();
    params.append("merchant_id", MERCHANT_ID);
    params.append("secured_key", SECURED_KEY);
    params.append("grant_type", "client_credentials");

    // Use a fixed IP or get from request context if possible, usually server IP for this call
    params.append("customer_ip", "127.0.0.1");

    const res = await fetch(`${BASE_URL}/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
        },
        body: params,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to get token");
    return data;
}

/**
 * Get List of Banks
 */
export async function getBanks(token) {
    const res = await fetch(`${BASE_URL}/list/banks?customer_ip=127.0.0.1`, {
        method: "GET",
        headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${token}`
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch banks");
    return data.banks || [];
}

/**
 * Initiate Transaction
 */
export async function initiateTransaction(token, transactionData) {
    const params = new URLSearchParams();
    Object.entries(transactionData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, value);
        }
    });

    const res = await fetch(`${BASE_URL}/transaction`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${token}`
        },
        body: params,
    });

    const data = await res.json();
    // GoPayFast returns 200 even for some logical errors, check code/status
    return data;
}
