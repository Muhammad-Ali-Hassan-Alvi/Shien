import dotenv from "dotenv";
import { SendEmailUtil, getDefaultFromAddress, isEmailConfigured } from "../src/utils/emailsender.js";

dotenv.config({ path: ".env.local" });

if (!isEmailConfigured()) {
    console.error("FAILED — set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local");
    process.exit(1);
}

const to = process.env.ADMIN_ORDER_EMAIL || process.env.EMAIL_USER;
const from = getDefaultFromAddress();

console.log("From:", from);
console.log("To:", to);

const result = await SendEmailUtil({
    to,
    subject: "Islamabad Mart SMTP test",
    text: "If you see this, order confirmation emails should work.",
    html: "<p>If you see this, order confirmation emails should work.</p>",
});

if (result.sent) {
    console.log("SUCCESS", result.messageId);
} else {
    console.error("FAILED", result.error || result.reason);
    process.exit(1);
}
