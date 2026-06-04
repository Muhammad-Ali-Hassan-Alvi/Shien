import User from "@/app/lib/model/User";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/services/EmailService";
import {
    notifyAllAdmins,
    createUserNotification,
    resolveUserId,
} from "@/lib/notificationService";

/**
 * Sends customer + admin emails and in-app notifications for a new/confirmed order.
 * Returns { customerEmailSent, customerEmailReason, recipient } for checkout UI.
 */
export async function notifyOrderPlaced({ order, userId, shippingInfo, sessionEmail }) {
    const resolvedUserId = resolveUserId(userId || order.user);
    const userRecord = resolvedUserId
        ? await User.findById(resolvedUserId).select("email name").lean()
        : null;
    const recipient =
        userRecord?.email ||
        sessionEmail ||
        shippingInfo?.email ||
        order.shippingInfo?.email ||
        null;
    const userName = userRecord?.name || shippingInfo?.fullName || order.shippingInfo?.fullName;
    const shortId = String(order._id).slice(-8).toUpperCase();
    const paymentLabel =
        order.paymentMethod === "GOPAYFAST" ? "Online" : "COD";

    let customerEmailSent = false;
    let customerEmailReason = null;

    try {
        if (resolvedUserId) {
            await createUserNotification({
                userId: resolvedUserId,
                type: "OrderPlaced",
                message: `Order #${shortId} placed — Rs. ${order.totalAmount.toLocaleString("en-PK")} (${paymentLabel})`,
                link: "/profile/orders",
            });
        }
    } catch (e) {
        console.error("Customer order notification failed:", e);
    }

    if (recipient) {
        const result = await sendOrderConfirmationEmail({
            to: recipient,
            order,
            userName,
        });
        customerEmailSent = result.sent === true;
        customerEmailReason = result.reason || result.error || null;

        if (!customerEmailSent) {
            console.warn(
                `[orderNotifications] Customer email not sent (${customerEmailReason || "unknown"}) → ${recipient}`
            );
        }
    } else {
        customerEmailReason = "no_recipient";
        console.warn("[orderNotifications] No email on account — skipping confirmation email");
    }

    try {
        await notifyAllAdmins({
            type: "NewOrder",
            message: `New order #${shortId} from ${userName || "Customer"} — Rs. ${order.totalAmount.toLocaleString("en-PK")}`,
            link: "/seller-center/orders",
        });
    } catch (e) {
        console.error("Admin order notification failed:", e);
    }

    try {
        await sendAdminNewOrderEmail({
            order,
            customerEmail: recipient,
            customerName: userName,
        });
    } catch (e) {
        console.error("Admin order email failed:", e);
    }

    return { customerEmailSent, customerEmailReason, recipient };
}
