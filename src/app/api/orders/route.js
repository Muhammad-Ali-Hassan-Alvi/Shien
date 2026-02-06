import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const orders = await Order.find({})
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
