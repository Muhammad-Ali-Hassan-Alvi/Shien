import nodemailer from "nodemailer";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@imart.com";
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "";

function getSmtpConfig() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    };
}

function formatFromAddress() {
    const raw =
        process.env.SMTP_FROM ||
        process.env.EMAIL_FROM ||
        process.env.SMTP_USER ||
        "noreply@imart.com";

    const trimmed = String(raw).trim();

    // Already "Name <email@domain.com>" — use as-is (avoid double-wrapping)
    if (/^[^<]*<[^>@]+@[^>]+>$/.test(trimmed)) {
        return trimmed;
    }

    const email = trimmed.includes("@") ? trimmed : process.env.SMTP_USER || trimmed;
    return `"iMART" <${email}>`;
}

export function isEmailConfigured() {
    return getSmtpConfig() !== null;
}

function formatShortOrderId(orderId) {
    return String(orderId).slice(-8).toUpperCase();
}

function formatRs(amount) {
    return `Rs. ${Number(amount).toLocaleString("en-PK")}`;
}

function buildItemsSummaryHtml(items) {
    if (!items?.length) {
        return "<p>No items listed.</p>";
    }

    const rows = items
        .map((item) => {
            const variant = item.variant
                ? `${item.variant.size || ""} / ${item.variant.color || ""}`.replace(
                      /^\/ | \/ $/g,
                      ""
                  )
                : "";
            const lineTotal = (item.price || 0) * (item.quantity || 1);
            return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(item.name || "Item")}</strong>
            ${variant ? `<br><span style="color:#666;font-size:13px;">${escapeHtml(variant)}</span>` : ""}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">×${item.quantity || 1}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${formatRs(lineTotal)}</td>
        </tr>`;
        })
        .join("");

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#111;">
      <thead>
        <tr style="border-bottom:2px solid #000;">
          <th align="left" style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
          <th align="center" style="padding:8px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
          <th align="right" style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function buildOrderConfirmationHtml({ order, userName }) {
    const shortId = formatShortOrderId(order._id);
    const shipping = order.shippingInfo || {};
    const itemsHtml = buildItemsSummaryHtml(order.items);
    const paymentLabel =
        order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : order.paymentMethod || "COD";
    const supportLine = SUPPORT_PHONE
        ? `${SUPPORT_EMAIL} · ${SUPPORT_PHONE}`
        : SUPPORT_EMAIL;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Order confirmed — iMART</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e5e5e5;">
          <tr>
            <td style="background:#000;color:#fff;padding:28px 32px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.7;">iMART</p>
              <h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-0.02em;">Order confirmed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#111;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px;">Hi ${escapeHtml(userName || shipping.fullName || "there")},</p>
              <p style="margin:0 0 24px;">Thank you for shopping with iMART. We have received your order and will process it shortly.</p>
              <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#666;">Order ID</p>
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;font-family:monospace;">#${shortId}</p>
              <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#666;">Items</p>
              ${itemsHtml}
              <p style="margin:24px 0 8px;text-align:right;font-size:16px;"><strong>Total: ${formatRs(order.totalAmount)}</strong></p>
              <div style="margin:24px 0;padding:16px;background:#fafafa;border-left:3px solid #000;">
                <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#666;">Shipping to</p>
                <p style="margin:0;font-size:14px;">
                  ${escapeHtml(shipping.fullName || "")}<br>
                  ${escapeHtml(shipping.address || "")}<br>
                  ${escapeHtml(shipping.city || "")}
                  ${shipping.phone ? `<br>${escapeHtml(shipping.phone)}` : ""}
                </p>
              </div>
              <div style="margin:0 0 24px;padding:14px 16px;background:#111;color:#fff;font-size:13px;">
                <strong>Payment:</strong> ${escapeHtml(paymentLabel)} — pay the courier when your package arrives. No online charge was taken.
              </div>
              <p style="margin:0;font-size:13px;color:#666;">
                Questions? Contact us at
                <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#000;font-weight:600;">${escapeHtml(supportLine)}</a>
                or visit the Help Center on imart.com.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center;">
              © iMART · This email is your order receipt for COD purchases.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildOrderConfirmationText({ order, userName }) {
    const shortId = formatShortOrderId(order._id);
    const shipping = order.shippingInfo || {};
    const lines = (order.items || []).map((item) => {
        const v = item.variant
            ? ` (${item.variant.size}/${item.variant.color})`
            : "";
        return `  - ${item.name}${v} ×${item.quantity} — ${formatRs((item.price || 0) * (item.quantity || 1))}`;
    });

    return `Hi ${userName || shipping.fullName || "there"},

Your iMART order #${shortId} is confirmed.

Items:
${lines.join("\n") || "  (none)"}

Total: ${formatRs(order.totalAmount)}

Ship to:
${shipping.fullName}
${shipping.address}
${shipping.city}
${shipping.phone || ""}

Payment: Cash on Delivery (COD) — pay when your package arrives.

Support: ${SUPPORT_EMAIL}${SUPPORT_PHONE ? ` · ${SUPPORT_PHONE}` : ""}

Thank you for shopping with iMART.`;
}

let transporter = null;

function getTransporter() {
    const config = getSmtpConfig();
    if (!config) return null;
    if (!transporter) {
        transporter = nodemailer.createTransport(config);
    }
    return transporter;
}

/**
 * Sends order confirmation email. Never throws on SMTP misconfiguration;
 * logs and returns silently. Callers should wrap in try/catch for transport errors.
 */
export async function sendOrderConfirmationEmail({ to, order, userName }) {
    if (!to) {
        console.warn("[EmailService] No recipient email; skipping order confirmation.");
        return { sent: false, reason: "no_recipient" };
    }

    const transport = getTransporter();
    if (!transport) {
        console.warn(
            "[EmailService] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Skipping order confirmation email."
        );
        return { sent: false, reason: "smtp_not_configured" };
    }

    const from = formatFromAddress();
    const shortId = formatShortOrderId(order._id);
    const html = buildOrderConfirmationHtml({ order, userName });
    const text = buildOrderConfirmationText({ order, userName });

    try {
        const info = await transport.sendMail({
            from,
            to,
            subject: `Order confirmed — #${shortId} | iMART`,
            text,
            html,
        });

        if (process.env.NODE_ENV !== "production") {
            console.info("[EmailService] Order confirmation sent to", to, info.messageId || "");
        }

        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error("[EmailService] Order confirmation failed:", err.message);
        return { sent: false, reason: "send_failed", error: err.message };
    }
}

/**
 * Notifies operations inbox of a new order. Non-blocking; never throws to caller.
 */
export async function sendAdminNewOrderEmail({ order, customerEmail, customerName }) {
    const adminEmail = process.env.ADMIN_ORDER_EMAIL;
    if (!adminEmail) {
        return { sent: false, reason: "no_admin_email" };
    }

    const transport = getTransporter();
    if (!transport) {
        return { sent: false, reason: "smtp_not_configured" };
    }

    const shortId = formatShortOrderId(order._id);

    try {
        const info = await transport.sendMail({
            from: formatFromAddress(),
            to: adminEmail,
            subject: `New order #${shortId} — Rs. ${Number(order.totalAmount).toLocaleString("en-PK")}`,
            text: `New COD order #${shortId}
Customer: ${customerName || "—"} (${customerEmail || "—"})
Total: ${formatRs(order.totalAmount)}
Items: ${order.items?.length || 0}
City: ${order.shippingInfo?.city || "—"}

Review in Seller Center → Orders.`,
        });

        return { sent: true, messageId: info.messageId };
    } catch (err) {
        console.error("[EmailService] Admin order email failed:", err.message);
        return { sent: false, reason: "send_failed", error: err.message };
    }
}

/**
 * Sends a 4-digit password reset code. Returns { sent: false } if SMTP missing.
 */
export async function sendPasswordResetCodeEmail({ to, userName, code }) {
    if (!to) {
        return { sent: false, reason: "no_recipient" };
    }

    const transport = getTransporter();
    if (!transport) {
        console.warn("[EmailService] SMTP not configured; cannot send password reset code.");
        return { sent: false, reason: "smtp_not_configured" };
    }

    const from = formatFromAddress();
    const greeting = userName ? `Hi ${userName},` : "Hi,";

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#111;">
      <p style="font-size:16px;">${escapeHtml(greeting)}</p>
      <p style="font-size:14px;color:#444;">Use this code to reset your iMART password. It expires in <strong>15 minutes</strong>.</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#f5f5f5;border-radius:8px;margin:24px 0;">${escapeHtml(code)}</p>
      <p style="font-size:13px;color:#666;">If you did not request this, you can ignore this email.</p>
      <p style="font-size:13px;color:#666;">Support: ${escapeHtml(SUPPORT_EMAIL)}</p>
    </div>`;

    const text = `${greeting}

Your iMART password reset code: ${code}

This code expires in 15 minutes.

If you did not request this, ignore this email.
Support: ${SUPPORT_EMAIL}`;

    await transport.sendMail({
        from,
        to,
        subject: `Your password reset code: ${code} | iMART`,
        text,
        html,
    });

    return { sent: true };
}
