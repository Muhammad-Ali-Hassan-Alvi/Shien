
"use client";

import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { addReview, getReviews } from "@/app/lib/review-actions"; // Need to ensure getReviews is server action or called here
// Actually getReviews is best called in parent server component, but for client interactivity (loading more etc), 
// we can call it here or pass initial reviews.
// For simplicity, let's fetch on mount.

import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ProductReviews({ productId }) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    async function fetchReviews() {
        try {
            // We can treat getReviews as a server action that returns data
            const data = await getReviews(productId);
            setReviews(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        const res = await addReview(productId, rating, comment);

        if (res.success) {
            toast.success("Review submitted!");
            setComment("");
            fetchReviews();
        } else {
            toast.error(res.error || "Failed to submit");
        }
        setSubmitting(false);
    }

    // Calculate Stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-16" id="reviews">
            <h2 className="text-2xl font-playfair font-bold mb-8 flex items-center gap-4">
                Customer Reviews
                <span className="text-sm font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-600">{totalReviews}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                {/* Left: Summary & Form */}
                <div className="md:col-span-1 space-y-8">
                    {/* Summary Card */}
                    <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
                        <div className="text-5xl font-black text-gray-900 mb-2">{averageRating}</div>
                        <div className="flex justify-center gap-1 mb-2 text-yellow-400">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={20} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} strokeWidth={3} />
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm">Based on {totalReviews} reviews</p>
                    </div>

                    {/* Write Review */}
                    <div className="bg-white border p-6 rounded-2xl shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Write a Review</h3>
                        {session ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                <Star size={24} fill="currentColor" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Review</label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-black outline-none"
                                        placeholder="Share your experience..."
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    disabled={submitting}
                                    className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : "Post Review"}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500 mb-4">Please login to write a review.</p>
                                <button onClick={() => window.location.href = '/auth/login'} className="text-sm font-bold underline">Login Here</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Reviews List */}
                <div className="md:col-span-2 space-y-6">
                    {loading ? (
                        <p className="text-gray-500 text-center py-8">Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No reviews yet. Be the first!</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div key={review._id} className="border-b border-gray-100 pb-8 last:border-0">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                            {review.user?.image ? (
                                                <Image src={review.user.image} fill className="object-cover" alt="User" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={20} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{review.user?.name || "Customer"}</h4>
                                            <div className="flex gap-0.5 text-yellow-400 text-xs">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
