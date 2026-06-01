import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import User from "@/app/lib/model/User";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { OrderService } from "@/services/OrderService";
import { notifyOrderPlaced } from "@/app/lib/orderNotifications";
import { notifyOrderStatusUpdate } from "@/lib/notificationService";

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();

        let query = {};
        if (session?.user?.role !== "admin") {
            if (!session?.user?.id) return NextResponse.json({ orders: [] });
            query = { user: session.user.id };
        }

        const orders = await Order.find(query)
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { items, shippingInfo, paymentMethod } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        if (paymentMethod && paymentMethod !== "COD") {
            return NextResponse.json(
                { error: "Only Cash on Delivery is available right now. Online payment coming soon." },
                { status: 400 }
            );
        }

        const method = "COD";
        let emailStatus = { customerEmailSent: false, customerEmailReason: null, recipient: null };

        const newOrder = await OrderService.createOrder(session.user.id, {
            items,
            shippingInfo,
            paymentMethod: method,
        });

        let userRecord = null;
        try {
            userRecord = await User.findById(session.user.id);
            if (userRecord) {
                const exists = userRecord.addresses?.some(
                    (a) => a.address === shippingInfo.address && a.city === shippingInfo.city
                );
                if (!exists) {
                    userRecord.addresses.push({
                        fullName: shippingInfo.fullName,
                        phone: shippingInfo.phone,
                        address: shippingInfo.address,
                        city: shippingInfo.city,
                        isDefault: userRecord.addresses.length === 0,
                    });
                    await userRecord.save();
                }
            }
        } catch (e) {
            console.error("Address save failed", e);
        }

        if (method === "COD") {
            try {
                const emailResult = await notifyOrderPlaced({
                    order: newOrder,
                    userId: session.user.id,
                    shippingInfo,
                    sessionEmail: session.user.email,
                });
                emailStatus = emailResult;
            } catch (notifyErr) {
                console.error("Order notifications failed:", notifyErr);
            }
        }

        if (process.env.NODE_ENV !== "production") {
            console.info("[orders] New order created:", String(newOrder._id).slice(-8));
        }

        return NextResponse.json(
            {
                success: true,
                orderId: newOrder._id,
                paymentMethod: method,
                requiresPayment: method === "GOPAYFAST",
                emailSent: emailStatus.customerEmailSent,
                emailTo: emailStatus.recipient || session.user.email || null,
                emailError: emailStatus.customerEmailReason,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Order Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingOrder = await Order.findById(orderId);
        if (!existingOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const previousStatus = existingOrder.status;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (updatedOrder) {
            try {
                await notifyOrderStatusUpdate(updatedOrder, status, { previousStatus });
            } catch (e) {
                console.error("Order status notification failed:", e);
            }
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
