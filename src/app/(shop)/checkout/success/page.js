"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { getSupportPhone } from "@/app/lib/support";

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCartStore();
    const [state, setState] = useState({ loading: true, orderId: null, error: null });

    useEffect(() => {
        const signature = searchParams.get("signature");
        const orderId = searchParams.get("order_id") || searchParams.get("basket_id");

        if (!orderId || !signature) {
            setState({
                loading: false,
                error: "Missing payment confirmation. Contact support if you were charged.",
            });
            return;
        }

        (async () => {
            try {
                const res = await fetch(
                    `/api/checkout/payfast/verify?signature=${encodeURIComponent(signature)}&order_id=${encodeURIComponent(orderId)}`
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Verification failed");

                clearCart();
                setState({ loading: false, orderId: data.orderId });
            } catch (e) {
                setState({ loading: false, error: e.message });
            }
        })();
    }, [searchParams, clearCart]);

    const supportPhone = getSupportPhone() || "support";

    if (state.loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin" size={40} />
                <p className="text-gray-600">Confirming your payment…</p>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
                    <h1 className="text-2xl font-bold mb-4">Payment verification issue</h1>
                    <p className="text-gray-600 mb-6">{state.error}</p>
                    <button
                        onClick={() => router.push("/profile/orders")}
                        className="w-full bg-black text-white py-3 font-bold rounded"
                    >
                        View orders
                    </button>
                </div>
            </div>
        );
    }

    const shortId = String(state.orderId).slice(-6).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
                <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <h1 className="text-3xl font-playfair font-bold mb-2">Payment successful</h1>
                <p className="text-gray-500 mb-6">
                    Order <span className="font-mono font-bold text-black">#{shortId}</span> is confirmed.
                    A confirmation email has been sent if SMTP is configured.
                </p>
                <p className="text-xs text-gray-500 mb-8">
                    Questions? Call {supportPhone}
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="w-full bg-black text-white py-3 font-bold rounded hover:bg-gray-800 transition"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                </div>
            }
        >
            <CheckoutSuccessContent />
        </Suspense>
    );
}
