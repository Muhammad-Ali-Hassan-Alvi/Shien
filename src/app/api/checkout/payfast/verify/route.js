import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { confirmPayFastOrder } from "@/services/OrderPaymentService";

export async function GET(request) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const signature = searchParams.get("signature");
        const orderId = searchParams.get("order_id") || searchParams.get("basket_id");

        if (!orderId || !signature) {
            return NextResponse.json(
                { error: "Missing signature or order_id" },
                { status: 400 }
            );
        }

        const result = await confirmPayFastOrder({ basketId: orderId, signature });

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: result.status || 400 });
        }

        if (session?.user?.id && String(result.order.user) !== String(session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            orderId: result.order._id,
            alreadyPaid: result.alreadyPaid || false,
        });
    } catch (error) {
        console.error("[checkout/payfast/verify]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
