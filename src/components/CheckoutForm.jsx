"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StyledSelect from "@/components/ui/StyledSelect";

const CITIES = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot",
    "Hyderabad", "Abbottabad", "Bahawalpur", "Sargodha", "Other"
];

export default function CheckoutForm({ onSuccess }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { items, getCartTotal, hasHydrated } = useCartStore();
    const isLoggedIn = status === "authenticated";

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "Karachi",
        nearestLandmark: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setFormData((prev) => ({
                ...prev,
                fullName: session.user.name || prev.fullName,
                email: session.user.email || prev.email,
                phone: session.user.phone || prev.phone,
            }));
        }
    }, [session]);

    if (status === "loading") {
        return <div className="p-8 text-center">Loading checkout...</div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!/^03\d{9}$/.test(formData.phone)) {
            toast.error("Invalid Phone Format. Example: 03001234567");
            setLoading(false);
            return;
        }

        const email = formData.email?.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address");
            setLoading(false);
            return;
        }

        const orderData = {
            items: items.map((item) => ({
                product: item._id,
                quantity: item.quantity,
                variant: item.variant,
            })),
            shippingInfo: { ...formData, email },
            paymentMethod: "COD",
        };

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Order Failed");

            toast.success("Order Placed!");

            const { clearCart, removeOrderedItems } = useCartStore.getState();
            if (orderData.items.length > 0) {
                removeOrderedItems(orderData.items);
            }
            if (useCartStore.getState().items.length === 0) {
                clearCart();
            }

            if (onSuccess) {
                onSuccess(data.orderId, {
                    emailSent: data.emailSent,
                    emailTo: data.emailTo,
                    isGuest: !isLoggedIn,
                });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoggedIn && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-600">
                        Checking out as a guest? Enter your email below for order confirmation.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/auth/login?callbackUrl=/checkout")}
                        className="text-sm font-bold underline hover:no-underline"
                    >
                        Sign in instead
                    </button>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-xl font-bold border-b pb-2">Shipping Details</h2>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            name="fullName"
                            required
                            value={formData.fullName}
                            className="w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            readOnly={isLoggedIn && !!session?.user?.email}
                            value={formData.email}
                            placeholder="you@email.com"
                            className={`w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none ${
                                isLoggedIn && session?.user?.email ? "bg-gray-50 text-gray-600" : ""
                            }`}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Order confirmation will be sent to this email.
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Phone Number (03...)</label>
                        <input
                            name="phone"
                            type="tel"
                            maxLength={11}
                            placeholder="03XXXXXXXXX"
                            required
                            value={formData.phone}
                            className="w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <textarea
                            name="address"
                            rows={2}
                            required
                            value={formData.address}
                            className="w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">City</label>
                            <StyledSelect
                                name="city"
                                className="mt-1"
                                value={formData.city}
                                onChange={handleChange}
                                options={CITIES}
                                aria-label="City"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Landmark</label>
                            <input
                                name="nearestLandmark"
                                value={formData.nearestLandmark}
                                className="w-full border p-3 rounded mt-1 focus:ring-1 focus:ring-black outline-none"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h2 className="text-xl font-bold mb-4">Payment</h2>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-black bg-gray-50 rounded-md cursor-default">
                        <input
                            type="radio"
                            name="payment"
                            value="COD"
                            checked
                            readOnly
                            className="w-5 h-5 accent-black"
                        />
                        <div>
                            <span className="font-bold">Cash on Delivery (COD)</span>
                            <p className="text-xs text-gray-500 mt-0.5">Pay when your package arrives</p>
                        </div>
                    </label>

                    <div
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-md bg-gray-50 opacity-60 cursor-not-allowed"
                        aria-disabled="true"
                    >
                        <input type="radio" disabled className="w-5 h-5" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-500">PayFast · Cards & Wallets</span>
                                <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                    Coming soon
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">Online payment will be available in a future update</p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !hasHydrated || items.length === 0}
                className="w-full bg-black text-white py-4 font-bold text-lg uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 rounded-md"
            >
                {loading
                    ? "Processing..."
                    : !hasHydrated
                      ? "Loading cart…"
                      : `Place Order (Rs. ${getCartTotal().toLocaleString()})`}
            </button>

            {!isLoggedIn && (
                <p className="text-center text-xs text-gray-500">
                    Have an account?{" "}
                    <Link href="/auth/login?callbackUrl=/checkout" className="font-semibold underline">
                        Sign in
                    </Link>{" "}
                    to track orders in your profile.
                </p>
            )}
        </form>
    );
}
