import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import { verifyPaymentSignature } from "@/services/PayFastService";
import { notifyOrderPlaced } from "@/app/lib/orderNotifications";

function merchantConfig() {
    return {
        merchantId:
            process.env.GOPAYFAST_MERCHANT_ID || process.env.PAYFAST_MERCHANT_ID || "",
        merchantName:
            process.env.GOPAYFAST_MERCHANT_NAME ||
            process.env.PAYFAST_MERCHANT_NAME ||
            "iMART",
    };
}

/**
 * Marks a PayFast order as paid after signature verification. Idempotent.
 */
export async function confirmPayFastOrder({ basketId, signature }) {
    await connectDB();

    const order = await Order.findById(basketId);
    if (!order) {
        return { ok: false, error: "Order not found", status: 404 };
    }

    if (order.paymentMethod !== "GOPAYFAST") {
        return { ok: false, error: "Not a PayFast order", status: 400 };
    }

    if (order.paymentStatus === "paid") {
        return { ok: true, order, alreadyPaid: true };
    }

    const { merchantId, merchantName } = merchantConfig();
    const valid = verifyPaymentSignature({
        signature,
        merchantId,
        merchantName,
        amount: order.totalAmount,
        basketId: String(order._id),
    });

    if (!valid) {
        return { ok: false, error: "Invalid payment signature", status: 400 };
    }

    order.paymentStatus = "paid";
    order.status = "Confirmed";
    await order.save();

    await notifyOrderPlaced({
        order,
        userId: order.user,
        shippingInfo: order.shippingInfo,
    });

    return { ok: true, order };
}

export async function markPayFastOrderFailed(basketId) {
    await connectDB();
    const order = await Order.findById(basketId);
    if (!order || order.paymentMethod !== "GOPAYFAST") return null;
    if (order.paymentStatus === "paid") return order;

    order.paymentStatus = "failed";
    await order.save();
    return order;
}
