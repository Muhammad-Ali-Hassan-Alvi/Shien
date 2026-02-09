
"use server";

import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Review from "@/app/lib/model/Review";
import Product from "@/app/lib/model/Product";
import Order from "@/app/lib/model/Order";
import { revalidatePath } from "next/cache";

export async function addReview(productId, rating, comment) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Please login to review" };

        if (!rating || rating < 1 || rating > 5) return { error: "Invalid rating" };
        if (!comment) return { error: "Comment is required" };

        await connectDB();

        // 1. Check for Verified Purchase (Delivered Order)
        const hasPurchased = await Order.findOne({
            user: session.user.id,
            "items.product": productId,
            status: "Delivered"
        });

        if (!hasPurchased) {
            return { error: "Verified Purchase Required: You must have bought and received this item to review it." };
        }

        // 2. Check if user already reviewed
        const existing = await Review.findOne({ product: productId, user: session.user.id });
        if (existing) return { error: "You have already reviewed this product" };

        // Create Review - Auto Approve for now
        const newReview = await Review.create({
            user: session.user.id,
            product: productId,
            rating,
            comment,
            status: "Approved"
        });

        // Update Product Stats
        const stats = await Review.aggregate([
            { $match: { product: newReview.product, status: "Approved" } },
            {
                $group: {
                    _id: "$product",
                    avg: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                averageRating: stats[0].avg,
                reviewCount: stats[0].count
            });
        }

        revalidatePath(`/product/${productId}`);
        return { success: true };

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

    // Check for Delivered Order
    const hasPurchased = await Order.findOne({
        user: session.user.id,
        "items.product": productId,
        status: "Delivered"
    });

    return !!hasPurchased;
}
