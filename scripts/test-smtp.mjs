import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: ".env.local" });

const raw = process.env.SMTP_FROM || process.env.SMTP_USER;
const trimmed = String(raw).trim();
const from = /^[^<]*<[^>@]+@[^>]+>$/.test(trimmed)
    ? trimmed
    : `"iMART" <${trimmed.includes("@") ? trimmed : process.env.SMTP_USER}>`;

const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

try {
    const info = await transport.sendMail({
        from,
        to: process.env.ADMIN_ORDER_EMAIL,
        subject: "iMART SMTP test",
        text: "If you see this, order confirmation emails should work.",
    });
    console.log("SUCCESS", info.messageId);
} catch (e) {
    console.error("FAILED", e.message);
    process.exit(1);
}
