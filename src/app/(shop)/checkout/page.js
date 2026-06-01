"use client";

import CheckoutForm from "@/components/CheckoutForm";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { getSupportPhone } from "@/app/lib/support";
import Image from "next/image";

const supportPhone = getSupportPhone() || "our support line";

export default function CheckoutPage() {
    const { items, clearCart, getCartTotal } = useCartStore();
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [emailInfo, setEmailInfo] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (items.length === 0 && !orderSuccess) {
            router.replace("/");
        }
    }, [items, orderSuccess, router]);

    const handleSuccess = (orderId, emailMeta) => {
        clearCart();
        setOrderSuccess(orderId);
        setEmailInfo(emailMeta || null);
        window.scrollTo(0, 0);
    };

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
                    <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h1 className="text-3xl font-playfair font-bold mb-2">Thank You!</h1>
                    <p className="text-gray-500 mb-6">Your order <span className="font-mono font-bold text-black">#{orderSuccess.slice(-6).toUpperCase()}</span> has been verified.</p>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
                        Wait for a confirmation call from <span className="font-bold">{supportPhone}</span> before shipping.
                    </div>

                    {emailInfo?.emailSent ? (
                        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3 mb-6">
                            Confirmation email sent to <span className="font-semibold">{emailInfo.emailTo}</span>. Check spam if you don&apos;t see it.
                        </p>
                    ) : (
                        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6">
                            Email receipt could not be sent{emailInfo?.emailTo ? ` to ${emailInfo.emailTo}` : ""}. Your order is still confirmed — check Profile → Orders or wait for our call.
                        </p>
                    )}

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-black text-white py-3 font-bold rounded hover:bg-gray-800 transition"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    const subtotal = getCartTotal();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-playfair font-bold mb-8 text-center text-black">Secure Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                        <CheckoutForm onSuccess={handleSuccess} />
                    </div>

                    <aside className="md:col-span-1 md:sticky md:top-24 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold border-b pb-2">Order Summary</h2>
                        <ul className="space-y-3 max-h-64 overflow-y-auto">
                            {items.map((item) => (
                                <li key={`${item._id}-${item.variant?.size}-${item.variant?.color}`} className="flex gap-3 text-sm">
                                    <div className="relative w-14 h-16 shrink-0 bg-gray-100 rounded overflow-hidden">
                                        {item.images?.[0] && (
                                            <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="56px" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                                    </div>
                                    <span className="font-medium shrink-0">
                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total</span>
                            <span>Rs. {subtotal.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">Cash on Delivery only — pay when your package arrives.</p>
                    </aside>
                </div>
            </div>
        </div>
    );
}
