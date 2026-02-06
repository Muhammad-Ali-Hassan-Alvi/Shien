import StatsCard from "@/components/admin/StatsCard";
import { DollarSign, ShoppingBag, Users, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SellerCenterDashboard() {
    return (
        <div className="space-y-8 relative min-h-screen pb-12">

            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm bg-white/30 p-6 rounded-3xl border border-white/50 shadow-sm">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white/50 backdrop-blur-md border border-white/60 text-sm font-bold text-gray-700 rounded-xl hover:bg-white hover:shadow-lg transition-all active:scale-95">
                        Export Report
                    </button>
                    <Link href="/seller-center/products/new" className="px-5 py-2.5 bg-black/90 backdrop-blur-md text-white text-sm font-bold rounded-xl hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg flex items-center justify-center gap-2">
                        <span>+</span> Add Product
                    </Link>
                </div>
            </div>

            {/* KPI Grid - StatsCard handles its own glass styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value="$45,231.89"
                    trend="up"
                    trendValue="+20.1%"
                    icon={DollarSign}
                    color="bg-yellow-100"
                />
                <StatsCard
                    title="Pending Orders"
                    value="15"
                    trend="up"
                    trendValue="+2 this hour"
                    icon={ShoppingBag}
                    color="bg-blue-100"
                />
                <StatsCard
                    title="Delivered Orders"
                    value="1,245"
                    trend="up"
                    trendValue="+18 today"
                    icon={Users}
                    color="bg-green-100"
                />
                <StatsCard
                    title="Conversion Rate"
                    value="3.2%"
                    trend="down"
                    trendValue="-1.1%"
                    icon={Activity}
                    color="bg-pink-100"
                />
            </div>

            {/* Main Content Split: Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sales Chart Area */}
                <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-playfair font-bold text-xl text-gray-900">Revenue Analytics</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Performance over time</p>
                        </div>
                        <select className="bg-white/50 border border-white/60 text-sm font-bold text-gray-600 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-black/5 cursor-pointer hover:bg-white transition-colors">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    {/* CSS Bar Chart Mock */}
                    <div className="h-72 flex items-end justify-between gap-4 px-2 pb-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-white/40 rounded-2xl relative group h-full flex items-end overflow-hidden">
                                <div
                                    className="w-full bg-gray-900 rounded-2xl transition-all duration-700 ease-out group-hover:bg-indigo-600 relative overflow-hidden"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 shadow-xl whitespace-nowrap z-10 pointer-events-none">
                                    ${h}k Revenue
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-xs text-gray-400 font-bold uppercase tracking-wider px-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-playfair font-bold text-xl text-gray-900">Recent Orders</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Latest transactions</p>
                        </div>
                        <Link href="/seller-center/orders" className="px-4 py-2 bg-white/60 backdrop-blur-md border border-white/60 rounded-lg text-xs font-bold text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all uppercase tracking-wider shadow-sm">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="group flex items-center gap-4 py-3 p-3 rounded-2xl hover:bg-white/60 transition-all cursor-pointer border border-transparent hover:border-white/50 hover:shadow-sm">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-black text-xs text-gray-500 shadow-inner group-hover:from-indigo-100 group-hover:to-blue-100 group-hover:text-indigo-600 transition-colors">
                                    JD
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">John Doe</p>
                                    <p className="text-xs text-gray-400 font-medium">2 mins ago • Order #102{i}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">$120.00</p>
                                    <span className="text-[10px] bg-green-100/50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Paid</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
