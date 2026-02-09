import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import User from "@/app/lib/model/User";
import Product from "@/app/lib/model/Product"; // Ensure imported
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();

        let query = {};
        // If logged in user is admin, show all? Usually yes.
        // If user, show only theirs.
        if (session?.user?.role !== 'admin') {
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

        let totalAmount = 0;
        const finalOrderItems = [];

        // Validate and Calculate Total
        for (const item of items) {
            // item: { product: ID, quantity, variant }
            const product = await Product.findById(item.product);
            if (!product) continue;

            const price = product.pricing.salePrice;
            const quantity = item.quantity;

            totalAmount += price * quantity;

            finalOrderItems.push({
                product: product._id,
                name: product.name,
                slug: product.slug,
                image: product.images[0],
                price: price,
                quantity: quantity,
                variant: item.variant
            });
        }

        if (finalOrderItems.length === 0) {
            return NextResponse.json({ error: "No valid products found" }, { status: 400 });
        }

        // 1. Create Order
        const newOrder = await Order.create({
            user: session.user.id,
            items: finalOrderItems,
            shippingInfo,
            paymentMethod,
            totalAmount,
            status: "Pending"
        });

        // 2. Update User Address (Upsert logic simplified)
        try {
            const user = await User.findById(session.user.id);
            if (user) {
                const addressValues = Object.values(shippingInfo).join('').toLowerCase();
                // Simple check if this exact address exists to avoid duplicates
                // This is a naive check but works for now
                const exists = user.addresses.some(a =>
                    a.address === shippingInfo.address && a.city === shippingInfo.city
                );

                if (!exists) {
                    user.addresses.push({
                        fullName: shippingInfo.fullName,
                        phone: shippingInfo.phone,
                        address: shippingInfo.address,
                        city: shippingInfo.city,
                        isDefault: user.addresses.length === 0
                    });
                    await user.save();
                }
            }
        } catch (e) {
            console.error("Address save failed", e);
            // Non-critical
        }

        return NextResponse.json({ success: true, orderId: newOrder._id }, { status: 201 });

    } catch (error) {
        console.error("Order Creation Error:", error);
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
