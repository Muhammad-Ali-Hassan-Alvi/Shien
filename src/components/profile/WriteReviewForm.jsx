"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { addReview } from "@/app/lib/review-actions";

export default function WriteReviewForm({
    product,
    canReview,
    alreadyReviewed,
    backHref,
}) {
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        const res = await addReview(product._id, rating, comment, {
            productName: product.name,
        });
        setSubmitting(false);

        if (res.success) {
            toast.success(res.pending ? "Review submitted for approval!" : "Review submitted!");
            router.push(backHref);
            router.refresh();
            return;
        }
        toast.error(res.error || "Failed to submit review");
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-16 h-16 bg-white rounded-lg shrink-0 overflow-hidden relative border border-gray-200">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            No img
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Reviewing
                    </p>
                    <h2 className="font-bold text-gray-900 line-clamp-2">{product.name}</h2>
                    {product.productRemoved && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1 mt-2 inline-block">
                            This product was removed from the store — you can still review your purchase.
                        </p>
                    )}
                    {product.slug && !product.isArchived && !product.productRemoved && (
                        <Link
                            href={`/product/${product.slug}`}
                            className="text-xs text-gray-500 hover:underline mt-1 inline-block"
                        >
                            View product page
                        </Link>
                    )}
                </div>
            </div>

            {alreadyReviewed ? (
                <div className="text-center py-10 bg-green-50 rounded-xl border border-green-100">
                    <p className="font-bold text-green-800 mb-2">You already reviewed this product</p>
                    <p className="text-sm text-green-700 mb-6">Thank you for sharing your feedback.</p>
                    <Link
                        href={backHref}
                        className="inline-block px-6 py-2.5 bg-black text-white rounded-lg text-sm font-bold"
                    >
                        Back to order
                    </Link>
                </div>
            ) : canReview ? (
                <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-3">
                            Your rating
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-transform hover:scale-110 ${
                                        rating >= star ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                >
                                    <Star size={28} fill="currentColor" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                            Your review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={5}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black outline-none resize-y"
                            placeholder="Share your experience with this product…"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50"
                    >
                        {submitting ? "Submitting…" : "Submit Review"}
                    </button>
                </form>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="font-bold text-gray-700 mb-2">Verified purchase required</p>
                    <p className="text-sm text-gray-500 mb-6">
                        You can review this product after your order has been delivered.
                    </p>
                    <Link
                        href={backHref}
                        className="inline-block px-6 py-2.5 bg-black text-white rounded-lg text-sm font-bold"
                    >
                        Back to order
                    </Link>
                </div>
            )}
        </div>
    );
}
