"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, Package, CheckCircle2, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { createTicket } from "@/app/lib/help-actions";
import {
    getOrderStatusColor,
    ORDER_STATUS_STEPS,
} from "@/app/lib/orderUtils";
import WriteReviewForm from "@/components/profile/WriteReviewForm";

export default function OrderDetailView({
    order,
    backHref = "/profile?tab=orders",
    reviewStatusByProduct = {},
    activeReview = null,
}) {
    const shortId = order._id.toString().slice(-8).toUpperCase();
    const placedAt = new Date(order.createdAt);
    const currentStep = ORDER_STATUS_STEPS.indexOf(order.status);
    const isCancelled = order.status === "Cancelled" || order.status === "Returned";

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to orders
                </Link>

                {activeReview && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-playfair font-bold text-gray-900">
                                    Write a Review
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Share your experience — reviews are checked before they go live.
                                </p>
                            </div>
                            <Link
                                href={activeReview.closeHref}
                                className="text-sm font-semibold text-gray-500 hover:text-black shrink-0"
                            >
                                Cancel
                            </Link>
                        </div>
                        <WriteReviewForm
                            product={activeReview.product}
                            canReview={activeReview.canReview}
                            alreadyReviewed={activeReview.alreadyReviewed}
                            backHref={activeReview.closeHref}
                        />
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-100">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                    Order
                                </p>
                                <h1 className="text-2xl font-playfair font-bold text-gray-900">
                                    #{shortId}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Placed on {placedAt.toLocaleDateString()} at{" "}
                                    {placedAt.toLocaleTimeString()}
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getOrderStatusColor(order.status)}`}
                            >
                                {order.status}
                            </span>
                        </div>

                        {!isCancelled && (
                            <div className="mt-8">
                                <div className="flex items-center justify-between gap-2">
                                    {ORDER_STATUS_STEPS.map((step, idx) => {
                                        const done = currentStep >= idx;
                                        const active = order.status === step;
                                        return (
                                            <div key={step} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                        done
                                                            ? "bg-black text-white"
                                                            : "bg-gray-100 text-gray-400"
                                                    } ${active ? "ring-2 ring-black ring-offset-2" : ""}`}
                                                >
                                                    {done ? <CheckCircle2 size={14} /> : idx + 1}
                                                </div>
                                                <span
                                                    className={`text-[10px] font-bold uppercase tracking-wide text-center truncate w-full ${
                                                        done ? "text-gray-900" : "text-gray-400"
                                                    }`}
                                                >
                                                    {step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <section>
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                                <Package size={16} />
                                Items ({order.items.length})
                            </h2>
                            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                                {order.items.map((item, idx) => {
                                    const productId = item.product?.toString?.() ?? item.product;
                                    const reviewStatus = productId
                                        ? reviewStatusByProduct[productId]
                                        : null;
                                    const canWriteReview =
                                        order.status === "Delivered" &&
                                        productId &&
                                        reviewStatus?.canReview !== false &&
                                        !reviewStatus?.alreadyReviewed;

                                    return (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-white">
                                        <div className="flex gap-4 flex-1 min-w-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative border border-gray-200">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name || "Product"}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {item.slug && !item.productUnavailable ? (
                                                <Link
                                                    href={`/product/${item.slug}`}
                                                    className="font-semibold text-gray-900 hover:underline line-clamp-2"
                                                >
                                                    {item.name || "Product"}
                                                </Link>
                                            ) : (
                                                <p className="font-semibold text-gray-900 line-clamp-2">
                                                    {item.name || "Product"}
                                                    {item.productUnavailable && (
                                                        <span className="block text-xs font-normal text-gray-400 mt-0.5">
                                                            Removed from store — you can still leave a review
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                            {(item.variant?.color || item.variant?.size) && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {[item.variant.color, item.variant.size]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 mt-1">
                                                Qty {item.quantity} × Rs.{" "}
                                                {item.price?.toLocaleString()}
                                            </p>
                                            {canWriteReview && productId && (
                                                <Link
                                                    href={`/profile/orders/${order._id}?review=${productId}`}
                                                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-gray-900 border border-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
                                                >
                                                    <Star size={12} />
                                                    Write a Review
                                                </Link>
                                            )}
                                            {order.status === "Delivered" && reviewStatus?.alreadyReviewed && (
                                                <p className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-green-700">
                                                    <CheckCircle2 size={12} />
                                                    Review submitted
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-bold text-gray-900 shrink-0 sm:text-right">
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </p>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </section>

                        <div className="grid md:grid-cols-2 gap-4">
                            <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                                    <MapPin size={16} />
                                    Shipping
                                </h2>
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p className="font-semibold text-gray-900">
                                        {order.shippingInfo?.fullName}
                                    </p>
                                    <p>{order.shippingInfo?.phone}</p>
                                    <p>{order.shippingInfo?.address}</p>
                                    <p>{order.shippingInfo?.city}</p>
                                    {order.shippingInfo?.nearestLandmark && (
                                        <p className="text-gray-500">
                                            Near: {order.shippingInfo.nearestLandmark}
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                                    <CreditCard size={16} />
                                    Payment
                                </h2>
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p>
                                        <span className="text-gray-500">Method:</span>{" "}
                                        {order.paymentMethod === "GOPAYFAST"
                                            ? "Online (PayFast)"
                                            : "Cash on Delivery"}
                                    </p>
                                    <p>
                                        <span className="text-gray-500">Status:</span>{" "}
                                        <span className="capitalize">{order.paymentStatus || "pending"}</span>
                                    </p>
                                </div>
                            </section>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-sm font-bold uppercase tracking-wider text-gray-500">
                                Order total
                            </span>
                            <span className="text-2xl font-playfair font-bold">
                                Rs. {order.totalAmount.toLocaleString()}
                            </span>
                        </div>

                        {order.status === "Delivered" && (
                            <RequestReturnButton order={order} />
                        )}

                        <Link
                            href={`/profile/help-center/new?orderId=${order._id}`}
                            className="block text-center text-sm font-semibold text-gray-600 hover:text-black underline"
                        >
                            Need help with this order?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RequestReturnButton({ order }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const shortId = order._id.toString().slice(-8).toUpperCase();

    const handleReturn = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.set("subject", `Return request for order #${shortId}`);
        formData.set("orderId", order._id.toString());
        formData.set(
            "message",
            "I would like to request a return for this order. Please advise on next steps."
        );
        formData.set("priority", "Medium");

        const res = await createTicket(null, formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
            return;
        }
        toast.success("Return request submitted");
        if (res.ticketId) {
            router.push(`/profile/help-center/${res.ticketId}`);
        } else {
            router.push("/profile/help-center");
        }
    };

    return (
        <button
            type="button"
            onClick={handleReturn}
            disabled={loading}
            className="w-full py-3 border border-gray-900 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
        >
            {loading ? "Submitting…" : "Request return"}
        </button>
    );
}
