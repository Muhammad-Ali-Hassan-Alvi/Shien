import nodemailer from "nodemailer";

let transporter = null;
let transportVerified = false;

function getSmtpConfig() {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host || !user || !pass) {
        return null;
    }

    const port = Number(process.env.SMTP_PORT || 587);

    return {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        user,
    };
}

export function isEmailConfigured() {
    return getSmtpConfig() !== null;
}

/** Brevo: use SMTP_FROM (verified sender in Brevo dashboard), not the SMTP login address. */
export function getDefaultFromAddress() {
    const config = getSmtpConfig();
    if (!config) {
        return null;
    }

    const raw =
        process.env.SMTP_FROM?.trim() ||
        process.env.EMAIL_FROM?.trim() ||
        config.user;

    if (/^[^<]*<[^>@]+@[^>]+>$/.test(raw)) {
        return raw;
    }

    const email = raw.includes("@") ? raw : config.user;
    const displayName = process.env.SMTP_FROM_NAME || "Islamabad Mart";
    return `"${displayName}" <${email}>`;
}

function getTransporter() {
    const config = getSmtpConfig();
    if (!config) {
        return null;
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.auth,
        });
    }

    return transporter;
}

async function ensureTransportReady(transport) {
    if (transportVerified) {
        return;
    }

    await transport.verify();
    transportVerified = true;
}

/**
 * Single entry point for all outbound email (Nodemailer → Brevo SMTP).
 */
export async function SendEmailUtil(body) {
    if (!body?.to) {
        console.warn("[SendEmailUtil] No recipient; skipping send.");
        return { sent: false, reason: "no_recipient" };
    }

    const transport = getTransporter();
    if (!transport) {
        console.warn(
            "[SendEmailUtil] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)."
        );
        return { sent: false, reason: "smtp_not_configured" };
    }

    const from = body.from || getDefaultFromAddress();
    if (!from) {
        return { sent: false, reason: "smtp_not_configured" };
    }

    const mail = { ...body, from };

    try {
        await ensureTransportReady(transport);
        const info = await transport.sendMail(mail);

        if (process.env.NODE_ENV !== "production") {
            console.info(
                "[SendEmailUtil] Sent to",
                body.to,
                info.messageId || ""
            );
        }

        return { sent: true, messageId: info.messageId };
    } catch (err) {
        transportVerified = false;
        console.error("[SendEmailUtil] Send failed:", err.message);
        return { sent: false, reason: "send_failed", error: err.message };
    }
}
