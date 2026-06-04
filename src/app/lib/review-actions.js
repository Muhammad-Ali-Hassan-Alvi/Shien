"use server";

import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Review from "@/app/lib/model/Review";
import Product from "@/app/lib/model/Product";
import Order from "@/app/lib/model/Order";
import { notifyAllAdmins } from "@/lib/notificationService";
import { revalidatePath } from "next/cache";

export async function addReview(productId, rating, comment, options = {}) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Please login to review" };

        if (!rating || rating < 1 || rating > 5) return { error: "Invalid rating" };
        if (!comment?.trim()) return { error: "Comment is required" };

        await connectDB();

        const deliveredOrder = await Order.findOne({
            user: session.user.id,
            "items.product": productId,
            status: "Delivered",
        }).lean();

        if (!deliveredOrder) {
            return {
                error: "Verified Purchase Required: You must have bought and received this item to review it.",
            };
        }

        const existing = await Review.findOne({ product: productId, user: session.user.id });
        if (existing) return { error: "You have already reviewed this product" };

        const product = await Product.findById(productId).select("name slug").lean();
        const orderItem = deliveredOrder.items.find(
            (item) => item.product && item.product.toString() === String(productId)
        );
        const productName =
            options.productName?.trim() ||
            product?.name ||
            orderItem?.name ||
            "Removed product";

        const newReview = await Review.create({
            user: session.user.id,
            product: productId,
            productName,
            rating,
            comment: comment.trim(),
            status: "Pending",
        });

        try {
            await notifyAllAdmins({
                type: "NewReview",
                message: `New ${rating}★ review on "${productName}" from ${session.user.name || "customer"}`,
                link: "/seller-center/reviews",
            });
        } catch (e) {
            console.error("Admin review notification failed:", e);
        }

        if (product?.slug) {
            revalidatePath(`/product/${product.slug}`);
        }
        return { success: true, pending: true };
    } catch (e) {
        console.error("Add Review Error:", e);
        return { error: "Failed to submit review" };
    }
}

export async function getReviews(productId) {
    await connectDB();
    const reviews = await Review.find({ product: productId, status: "Approved" })
        .populate("user", "name image")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(reviews));
}

export async function checkReviewEligibility(productId) {
    const session = await auth();
    if (!session?.user) return false;

    await connectDB();

    const hasPurchased = await Order.findOne({
        user: session.user.id,
        "items.product": productId,
        status: "Delivered",
    });

    if (!hasPurchased) return false;

    const existing = await Review.findOne({ product: productId, user: session.user.id });
    return !existing;
}

/** Per-product review state for items in a user's order (order detail page). */
export async function getOrderItemReviewStatus(orderId) {
    const session = await auth();
    if (!session?.user) return {};

    await connectDB();

    const order = await Order.findById(orderId).lean();
    if (!order || order.user.toString() !== session.user.id) return {};
    if (order.status !== "Delivered") return {};

    const productIds = order.items
        .map((item) => item.product)
        .filter(Boolean);

    if (productIds.length === 0) return {};

    const existingReviews = await Review.find({
        user: session.user.id,
        product: { $in: productIds },
    })
        .select("product status")
        .lean();

    const reviewedIds = new Set(existingReviews.map((r) => r.product.toString()));

    const status = {};
    for (const item of order.items) {
        if (!item.product) continue;
        const pid = item.product.toString();
        status[pid] = {
            canReview: !reviewedIds.has(pid),
            alreadyReviewed: reviewedIds.has(pid),
        };
    }
    return status;
}
