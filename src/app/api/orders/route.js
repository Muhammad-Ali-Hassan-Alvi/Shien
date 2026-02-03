import { NextResponse } from "next/server";
import { OrderService } from "@/services/OrderService";
import { OrderInputSchema } from "@/lib/validation";
import { auth } from "@/auth";

export async function POST(req) {
    try {
        const session = await auth();
        // Allow Guest Checkout? Yes, user ID can be null.
        const userId = session?.user?.id || null; // Or handle Guest logic

        const body = await req.json();

        // 1. Zod Validation
        const validation = OrderInputSchema.safeParse(body);

        if (!validation.success) {
            // Flatten errors for UI
            const errors = validation.error.flatten().fieldErrors;
            return NextResponse.json({
                success: false,
                message: "Validation Failed",
                errors
            }, { status: 400 });
        }

        // 2. Service Layer Execution (Transaction & Stock)
        const order = await OrderService.createOrder(userId, validation.data);

        // 3. Success Response
        return NextResponse.json({
            success: true,
            orderId: order._id,
            message: "Order placed successfully!"
        }, { status: 201 });

    } catch (error) {
        console.error("Order Creation Error:", error);

        // Detailed error handling
        if (error.message.includes("Insufficient stock") || error.message.includes("found")) {
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 409 }); // Conflict
        }

        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
