import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import User from "@/app/lib/model/User";
import {
    isPayFastConfigured,
    buildHostedCheckout,
    buildSimpleCheckoutRedirect,
    useSimpleCheckoutApi,
} from "@/services/PayFastService";

export async function GET() {
    return NextResponse.json({ enabled: isPayFastConfigured() });
}

export async function POST(request) {
    try {
        if (!isPayFastConfigured()) {
            return NextResponse.json(
                { error: "PayFast is not configured. Add GOPAYFAST_MERCHANT_ID and GOPAYFAST_SECURED_KEY to .env.local" },
                { status: 503 }
            );
        }

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await request.json();
        if (!orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        await connectDB();
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (String(order.user) !== String(session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (order.paymentMethod !== "GOPAYFAST") {
            return NextResponse.json({ error: "Order is not a PayFast payment" }, { status: 400 });
        }

        if (order.paymentStatus === "paid") {
            return NextResponse.json({ error: "Order already paid" }, { status: 400 });
        }

        const user = await User.findById(session.user.id).select("email").lean();
        const customerEmail = user?.email || session.user?.email || "";
        const customerMobile = order.shippingInfo?.phone || "";

        const forwarded = request.headers.get("x-forwarded-for");
        const customerIp = forwarded?.split(",")[0]?.trim() || "127.0.0.1";

        if (useSimpleCheckoutApi()) {
            const { redirectUrl, merchantTxnId } = await buildSimpleCheckoutRedirect({
                order,
                customerEmail,
                customerMobile,
            });
            order.payfastMerchantTxnId = merchantTxnId;
            await order.save();
            return NextResponse.json({ success: true, redirectUrl });
        }

        const hosted = await buildHostedCheckout({
            order,
            customerEmail,
            customerMobile,
            customerIp,
        });

        return NextResponse.json({
            success: true,
            checkoutUrl: hosted.checkoutUrl,
            fields: hosted.fields,
        });
    } catch (error) {
        console.error("[checkout/payfast]", error);
        return NextResponse.json(
            { error: error.message || "PayFast checkout failed" },
            { status: 500 }
        );
    }
}
