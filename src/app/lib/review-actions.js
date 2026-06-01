"use server";

import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Review from "@/app/lib/model/Review";
import Product from "@/app/lib/model/Product";
import Order from "@/app/lib/model/Order";
import { notifyAllAdmins } from "@/lib/notificationService";
import { revalidatePath } from "next/cache";

export async function addReview(productId, rating, comment) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Please login to review" };

        if (!rating || rating < 1 || rating > 5) return { error: "Invalid rating" };
        if (!comment) return { error: "Comment is required" };

        await connectDB();

        const hasPurchased = await Order.findOne({
            user: session.user.id,
            "items.product": productId,
            status: "Delivered",
        });

        if (!hasPurchased) {
            return {
                error: "Verified Purchase Required: You must have bought and received this item to review it.",
            };
        }

        const existing = await Review.findOne({ product: productId, user: session.user.id });
        if (existing) return { error: "You have already reviewed this product" };

        const product = await Product.findById(productId).select("name slug").lean();

        const newReview = await Review.create({
            user: session.user.id,
            product: productId,
            rating,
            comment,
            status: "Pending",
        });

        try {
            await notifyAllAdmins({
                type: "NewReview",
                message: `New ${rating}★ review on "${product?.name || "product"}" from ${session.user.name || "customer"}`,
                link: "/seller-center/reviews",
            });
        } catch (e) {
            console.error("Admin review notification failed:", e);
        }

        revalidatePath(`/product/${product?.slug || productId}`);
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

    return !!hasPurchased;
}
