import connectDB from "@/app/lib/config/db";
import Notification from "@/app/lib/model/Notification";
import User from "@/app/lib/model/User";
import Admin from "@/app/lib/model/Admin";
import {
    emitNotificationToUser,
    emitNotificationsRefresh,
    emitToAdmins,
} from "@/lib/socket-server";

function serializeNotification(doc) {
    const obj = doc?.toObject ? doc.toObject() : doc;
    return {
        ...obj,
        _id: String(obj._id),
        user: String(obj.user),
    };
}

export function resolveUserId(ref) {
    if (!ref) return null;
    if (typeof ref === "string") return ref;
    if (ref._id) return String(ref._id);
    return String(ref);
}

function formatOrderShortId(orderId) {
    return String(orderId).slice(-8).toUpperCase();
}

const ORDER_STATUS_CUSTOMER_MESSAGES = {
    Pending: (id) => `Your order #${id} is pending confirmation.`,
    Confirmed: (id) => `Your order #${id} has been confirmed — we're preparing it.`,
    Dispatched: (id) => `Your order #${id} has been dispatched and is on its way.`,
    Delivered: (id) => `Your order #${id} has been delivered. Enjoy!`,
    Cancelled: (id) => `Your order #${id} has been cancelled.`,
    Returned: (id) => `Your order #${id} has been marked as returned.`,
};

const ORDER_STATUS_ADMIN_MESSAGES = {
    Pending: (id, name) => `Order #${id} is pending for ${name}.`,
    Confirmed: (id, name) => `Order #${id} confirmed for ${name}.`,
    Dispatched: (id, name) => `Order #${id} dispatched to ${name}.`,
    Delivered: (id, name) => `Order #${id} delivered to ${name}.`,
    Cancelled: (id, name) => `Order #${id} cancelled (${name}).`,
    Returned: (id, name) => `Order #${id} marked returned (${name}).`,
};

export async function createUserNotification({ userId, type, message, link, isRead = false }) {
    await connectDB();
    const doc = await Notification.create({
        user: userId,
        type,
        message,
        link,
        isRead,
    });
    const payload = serializeNotification(doc);
    emitNotificationToUser(String(userId), payload);
    return doc;
}

export async function createManyUserNotifications(items, { emitRealtime = true } = {}) {
    if (!items?.length) return [];

    await connectDB();
    const docs = await Notification.insertMany(items);

    if (!emitRealtime) return docs;

    if (docs.length <= 50) {
        for (const doc of docs) {
            emitNotificationToUser(String(doc.user), serializeNotification(doc));
        }
    } else {
        const uniqueUserIds = [...new Set(docs.map((d) => String(d.user)))];
        for (const userId of uniqueUserIds) {
            emitNotificationsRefresh(userId);
        }
    }

    return docs;
}

export async function notifyAllAdmins({ type, message, link }) {
    await connectDB();
    const adminUsers = await User.find({ role: "admin" }).select("_id").lean();
    const admins = await Admin.find({}).select("_id").lean();

    const idSet = new Set([
        ...adminUsers.map((a) => String(a._id)),
        ...admins.map((a) => String(a._id)),
    ]);

    if (idSet.size === 0) return [];

    const items = [...idSet].map((userId) => ({
        user: userId,
        type,
        message,
        link,
        isRead: false,
    }));

    const docs = await createManyUserNotifications(items);

    for (const doc of docs) {
        emitToAdmins("notification", serializeNotification(doc));
    }
    emitToAdmins("notifications:refresh");

    return docs;
}

/** IDs that may own admin notifications for the signed-in seller-center user. */
export async function getAdminNotificationRecipientIds(session) {
    if (!session?.user?.id) return [];

    await connectDB();
    const ids = new Set([String(session.user.id)]);

    const email = session.user.email?.trim()?.toLowerCase();
    if (email) {
        const [adminDoc, userDoc] = await Promise.all([
            Admin.findOne({ email }).select("_id").lean(),
            User.findOne({ email }).select("_id").lean(),
        ]);
        if (adminDoc) ids.add(String(adminDoc._id));
        if (userDoc) ids.add(String(userDoc._id));
    }

    return [...ids];
}

/**
 * Notify only the order customer and admin team — never other shoppers.
 */
export async function notifyOrderStatusUpdate(order, status, { previousStatus } = {}) {
    if (!order?.user) return null;
    if (previousStatus && previousStatus === status) return null;

    const customerId = resolveUserId(order.user);
    if (!customerId) return null;

    const shortId = formatOrderShortId(order._id);
    const customerName =
        order.shippingInfo?.fullName ||
        order.user?.name ||
        "Customer";

    const customerMessage =
        ORDER_STATUS_CUSTOMER_MESSAGES[status]?.(shortId) ||
        `Your order #${shortId} is now ${status}.`;

    const adminMessage =
        ORDER_STATUS_ADMIN_MESSAGES[status]?.(shortId, customerName) ||
        `Order #${shortId} updated to ${status} (${customerName}).`;

    await createUserNotification({
        userId: customerId,
        type: "OrderUpdate",
        message: customerMessage,
        link: "/profile/orders",
    });

    await notifyAllAdmins({
        type: "OrderUpdate",
        message: adminMessage,
        link: "/seller-center/orders",
    });

    return true;
}

/** Alert admins when product stock is low */
export async function notifyLowStockIfNeeded(product, productId) {
    const LOW = 3;
    const variants = product?.variants || [];
    const lowParts = variants
        .filter((v) => typeof v.stock === "number" && v.stock > 0 && v.stock <= LOW)
        .map((v) => `${v.size || "?"}/${v.color || "?"}: ${v.stock} left`);

    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    if (lowParts.length > 0) {
        await notifyAllAdmins({
            type: "LowStock",
            message: `Low stock: "${product.name}" — ${lowParts.join(", ")}`,
            link: `/seller-center/products/edit/${productId}`,
        });
    } else if (totalStock === 0) {
        await notifyAllAdmins({
            type: "OutOfStock",
            message: `"${product.name}" is now out of stock`,
            link: `/seller-center/products/edit/${productId}`,
        });
    }
}
