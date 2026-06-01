"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Package, RefreshCw, CreditCard, Truck, ArrowRight, MessageCircle } from "lucide-react";

const TOPICS = {
    shipping: {
        label: "Shipping & Delivery",
        icon: Truck,
        href: "/shipping",
        title: "Shipping & Delivery",
        content: (
            <>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Standard delivery takes 5–7 business days across Pakistan. Express (2–3 days) and overnight options are available at checkout.
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
                    <li>Free standard shipping on orders over Rs. 2,500</li>
                    <li>Orders placed after 2 PM ship the next business day</li>
                    <li>Tracking is sent by SMS/email once dispatched</li>
                </ul>
            </>
        ),
    },
    returns: {
        label: "Returns & Refunds",
        icon: RefreshCw,
        href: "/returns",
        title: "Returns & Refunds",
        content: (
            <>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Return unworn items within 30 days of delivery for a refund or exchange. Final sale items cannot be returned.
                </p>
                <ol className="list-decimal pl-5 text-gray-600 space-y-2 text-sm">
                    <li>Go to My Orders in your profile</li>
                    <li>Select the order and request a return</li>
                    <li>Refunds process within 5–7 business days after inspection</li>
                </ol>
            </>
        ),
    },
    payments: {
        label: "Payments & Promos",
        icon: CreditCard,
        href: "/payments",
        title: "Payments & Promos",
        content: (
            <>
                <p className="text-gray-600 leading-relaxed mb-4">
                    We currently accept Cash on Delivery (COD) nationwide. Online payment via GoPayFast is coming soon.
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
                    <li>Pay when your order arrives — no upfront card required</li>
                    <li>Sale prices on products are applied automatically during campaigns</li>
                    <li>All prices are in Pakistani Rupees (PKR)</li>
                </ul>
            </>
        ),
    },
    track: {
        label: "Track Order",
        icon: Package,
        href: "/profile/orders",
        title: "Track Your Order",
        content: (
            <>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Sign in to view live status for every order: Pending, Confirmed, Dispatched, and Delivered.
                </p>
                <p className="text-sm text-gray-500">
                    You will also receive updates on the phone number used at checkout.
                </p>
            </>
        ),
    },
};

export default function HelpCenterClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTopic = searchParams.get("topic");
    const active = activeTopic && TOPICS[activeTopic] ? TOPICS[activeTopic] : null;

    useEffect(() => {
        if (activeTopic) {
            document.getElementById("help-topic-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [activeTopic]);

    const selectTopic = (key) => {
        router.push(`/help-center?topic=${key}`, { scroll: false });
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-playfair font-black text-gray-900 mb-6 tracking-tight">
                    How can we help?
                </h1>
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(TOPICS).map(([key, topic]) => {
                    const Icon = topic.icon;
                    const isActive = activeTopic === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => selectTopic(key)}
                            className={`p-6 rounded-xl border text-center flex flex-col items-center transition-all cursor-pointer ${
                                isActive
                                    ? "bg-black text-white border-black shadow-lg"
                                    : "bg-gray-50 hover:bg-white hover:shadow-lg border-gray-100 group"
                            }`}
                        >
                            <Icon
                                size={32}
                                className={`mb-4 transition-colors ${
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-black"
                                }`}
                            />
                            <span className="font-bold text-sm">{topic.label}</span>
                        </button>
                    );
                })}
            </div>

            {active && (
                <div
                    id="help-topic-panel"
                    className="mb-16 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm animate-in fade-in duration-300"
                >
                    <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-4">{active.title}</h2>
                    {active.content}
                    <Link
                        href={active.href}
                        className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                    >
                        View full details <ArrowRight size={16} />
                    </Link>
                </div>
            )}

            <h2 className="text-2xl font-bold font-playfair mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
                <details className="group p-6 border border-gray-100 rounded-xl bg-white hover:shadow-sm cursor-pointer transition-all">
                    <summary className="font-bold text-lg flex justify-between items-center list-none">
                        Where is my order?
                        <span className="text-gray-300 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Once your order is shipped, you will receive a tracking update. You can also track your order in{" "}
                        <Link href="/profile/orders" className="underline font-medium">
                            My Orders
                        </Link>
                        .
                    </p>
                </details>

                <details className="group p-6 border border-gray-100 rounded-xl bg-white hover:shadow-sm cursor-pointer transition-all">
                    <summary className="font-bold text-lg flex justify-between items-center list-none">
                        Can I modify or cancel my order?
                        <span className="text-gray-300 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Orders process quickly. You may cancel within 30 minutes of placing the order via your dashboard.
                        Afterward, you will need to initiate a return once the item arrives.
                    </p>
                </details>

                <details className="group p-6 border border-gray-100 rounded-xl bg-white hover:shadow-sm cursor-pointer transition-all">
                    <summary className="font-bold text-lg flex justify-between items-center list-none">
                        Do you ship internationally?
                        <span className="text-gray-300 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Yes, iMART ships to over 50 countries worldwide. International shipping rates and times vary by
                        destination.
                    </p>
                </details>
            </div>

            <div className="mt-20 relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-10 md:p-14 text-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none -z-0" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-100/40 rounded-full blur-3xl pointer-events-none -z-0" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-black/5 border border-white/60 flex items-center justify-center mb-6">
                        <MessageCircle size={28} className="text-gray-800" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-playfair font-bold text-gray-900 mb-3 tracking-tight">
                        Still need help?
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm md:text-base leading-relaxed">
                        Our support team is here for order issues, returns, and anything else — reach out anytime.
                    </p>
                    <Link
                        href="/profile/help-center"
                        className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                        Contact Support Team
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
