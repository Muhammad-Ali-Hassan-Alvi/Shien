import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { id } = await params; // Note: params might be async in newer Next.js but here likely extracted from context or route. 
        // Wait, in app directory [id]/route.js, yes. But user didn't ask for [id] folder, 
        // they asked for one huge file or separate.
        // I will place this in `src/app/api/orders/[id]/route.js` to be standard.

        // However, since I cannot create folders implicitly safely without knowing, I'll assume I have to make the folder.
        // I will write this to `src/app/api/orders/[id]/route.js`.

        const { status } = await req.json();

        if (!status) {
            return NextResponse.json({ error: "Status required" }, { status: 400 });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });

    } catch (error) {
        console.error("Order Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    // Optional: Get Single Order
    return NextResponse.json({ message: "Not Implemented" });
}
