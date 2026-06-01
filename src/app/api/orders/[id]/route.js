import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/requireAdmin";
import { notifyOrderStatusUpdate } from "@/lib/notificationService";

export async function PUT(req, { params }) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const { id } = await params;
        const { status } = await req.json();

        if (!status) {
            return NextResponse.json({ error: "Status required" }, { status: 400 });
        }

        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const previousStatus = existingOrder.status;
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

        try {
            await notifyOrderStatusUpdate(order, status, { previousStatus });
        } catch (e) {
            console.error("Order status notification failed:", e);
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Order Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Not Implemented" });
}
