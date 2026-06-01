"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailureContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id") || searchParams.get("basket_id");

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
                <div className="mx-auto bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                    <XCircle size={40} className="text-red-600" />
                </div>
                <h1 className="text-2xl font-playfair font-bold mb-2">Payment not completed</h1>
                <p className="text-gray-500 mb-6">
                    Your payment was cancelled or failed. No charge was completed on PayFast.
                    {orderId && (
                        <span className="block mt-2 font-mono text-sm">
                            Order ref: {String(orderId).slice(-8).toUpperCase()}
                        </span>
                    )}
                </p>
                <Link
                    href="/checkout"
                    className="block w-full bg-black text-white py-3 font-bold rounded hover:bg-gray-800 transition mb-3"
                >
                    Try again
                </Link>
                <Link href="/" className="text-sm text-gray-500 underline">
                    Continue shopping
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutFailurePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <FailureContent />
        </Suspense>
    );
}
