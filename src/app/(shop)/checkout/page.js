"use client";

import CheckoutForm from "@/components/CheckoutForm";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const [orderSuccess, setOrderSuccess] = useState(null);
    const router = useRouter();

    // Redirect if empty
    useEffect(() => {
        if (items.length === 0 && !orderSuccess) {
            // router.push('/'); 
        }
    }, [items, orderSuccess, router]);

    const handleSuccess = (orderId) => {
        clearCart();
        setOrderSuccess(orderId);
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

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-8">
                        Wait for a confirmation call from <span className="font-bold">0300-1234567</span> before shipping.
                    </div>

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

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-playfair font-bold mb-8 text-center text-black">Secure Checkout</h1>

                {/* We can reuse CheckoutForm component or Inline here. 
                 Since CheckoutForm handles logic, we need to pass a success callback to it. 
                 Let's modify CheckoutForm slightly to accept `onSuccess`.
             */}
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                    <CheckoutForm onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
}
