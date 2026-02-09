import Link from "next/link";
import { Search, Package, RefreshCw, CreditCard, Truck } from "lucide-react";

export default function HelpCenterPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-playfair font-black text-gray-900 mb-6 tracking-tight">How can we help?</h1>
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <Link href="/shipping" className="bg-gray-50 hover:bg-white hover:shadow-lg p-6 rounded-xl border border-gray-100 transition-all text-center flex flex-col items-center group">
                    <Truck size={32} className="text-gray-400 mb-4 group-hover:text-black transition-colors" />
                    <span className="font-bold text-sm">Shipping & Delivery</span>
                </Link>
                <Link href="/returns" className="bg-gray-50 hover:bg-white hover:shadow-lg p-6 rounded-xl border border-gray-100 transition-all text-center flex flex-col items-center group">
                    <RefreshCw size={32} className="text-gray-400 mb-4 group-hover:text-black transition-colors" />
                    <span className="font-bold text-sm">Returns & Refunds</span>
                </Link>
                <Link href="/payments" className="bg-gray-50 hover:bg-white hover:shadow-lg p-6 rounded-xl border border-gray-100 transition-all text-center flex flex-col items-center group">
                    <CreditCard size={32} className="text-gray-400 mb-4 group-hover:text-black transition-colors" />
                    <span className="font-bold text-sm">Payments & Promos</span>
                </Link>
                <Link href="/profile/orders" className="bg-gray-50 hover:bg-white hover:shadow-lg p-6 rounded-xl border border-gray-100 transition-all text-center flex flex-col items-center group">
                    <Package size={32} className="text-gray-400 mb-4 group-hover:text-black transition-colors" />
                    <span className="font-bold text-sm">Track Order</span>
                </Link>
            </div>

            <h2 className="text-2xl font-bold font-playfair mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
                <details className="group p-6 border border-gray-100 rounded-xl bg-white hover:shadow-sm cursor-pointer transition-all">
                    <summary className="font-bold text-lg flex justify-between items-center list-none">
                        Where is my order?
                        <span className="text-gray-300 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Once your order is shipped, you will receive a tracking number via email. You can also track your order status in your <Link href="/profile/orders" className="underline">Order History</Link>.
                    </p>
                </details>

                <details className="group p-6 border border-gray-100 rounded-xl bg-white hover:shadow-sm cursor-pointer transition-all">
                    <summary className="font-bold text-lg flex justify-between items-center list-none">
                        Can I modify or cancel my order?
                        <span className="text-gray-300 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Orders process quickly. You may cancel within 30 minutes of placing the order via your dashboard. Afterward, you will need to initiate a return once the item arrives.
                    </p>
                </details>

                <details className="group p-6 border border-gray-100 rounded-xl bg-white hover:shadow-sm cursor-pointer transition-all">
                    <summary className="font-bold text-lg flex justify-between items-center list-none">
                        Do you ship internationally?
                        <span className="text-gray-300 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Yes, iMART ships to over 50 countries worldwide. International shipping rates and times vary by destination.
                    </p>
                </details>
            </div>

            <div className="mt-20 bg-indigo-50 p-12 rounded-3xl text-center">
                <h3 className="text-2xl font-bold text-indigo-900 mb-4">Still need help?</h3>
                <p className="text-indigo-700 mb-8 max-w-lg mx-auto">Our dedicated support team is available 24/7 to assist you with any inquiries.</p>
                <Link href="/profile/help-center" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all hover:-translate-y-1">
                    Contact Support Team
                </Link>
            </div>
        </div>
    );
}
