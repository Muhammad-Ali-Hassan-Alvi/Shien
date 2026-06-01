import { NextResponse } from "next/server";
import { confirmPayFastOrder, markPayFastOrderFailed } from "@/services/OrderPaymentService";

/**
 * Server-to-server callback from PayFast (configure URL in merchant dashboard).
 * Accepts JSON or form-urlencoded body with signature + order_id / basket_id.
 */
export async function POST(request) {
    try {
        let payload = {};
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            payload = await request.json();
        } else {
            const form = await request.formData();
            form.forEach((value, key) => {
                payload[key] = value.toString();
            });
        }

        const signature =
            payload.signature ||
            payload.SIGNATURE ||
            payload.secure_hash;
        const basketId =
            payload.order_id ||
            payload.basket_id ||
            payload.BASKET_ID;

        const status = (
            payload.transaction_status ||
            payload.status ||
            payload.STATUS ||
            ""
        ).toString().toLowerCase();

        if (!basketId) {
            return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
        }

        const normalizedBasketId = String(basketId);

        if (status.includes("fail") || status === "02" || status === "failed") {
            await markPayFastOrderFailed(normalizedBasketId);
            return NextResponse.json({ received: true, status: "failed" });
        }

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const result = await confirmPayFastOrder({
            basketId: normalizedBasketId,
            signature,
        });

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: result.status || 400 });
        }

        return NextResponse.json({ received: true, status: "paid" });
    } catch (error) {
        console.error("[webhooks/payfast]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, message: "PayFast webhook endpoint" });
}
