"use client";

import { useState } from "react";
import StatsCard from "@/components/admin/StatsCard";
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardClient({ stats, recentOrders, chartData }) {
    const [range, setRange] = useState("week");
    const activeChart = chartData[range] || chartData.week;

    // Ensure data exists and handle empty states
    const dataPoints = activeChart?.data || [];
    const maxVal = Math.max(...dataPoints, 1); // Avoid division by zero

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

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`Rs. ${stats.revenue.toLocaleString()}`}
                    trend="up"
                    trendValue="+20.1%" // Placeholder for trend
                    icon={DollarSign}
                    color="bg-yellow-100"
                />
                <StatsCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    trend="up"
                    trendValue="Active"
                    icon={ShoppingBag}
                    color="bg-blue-100"
                />
                <StatsCard
                    title="Delivered Orders"
                    value={stats.deliveredOrders}
                    trend="up"
                    trendValue="Completed"
                    icon={Users}
                    color="bg-green-100"
                />
                <StatsCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    trend="up"
                    trendValue="All Time"
                    icon={Activity}
                    color="bg-pink-100"
                />
            </div>

            {/* Main Content Split: Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sales Chart Area */}
                <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-playfair font-bold text-xl text-gray-900">Revenue Analytics</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Performance over time</p>
                        </div>
                        <select
                            className="bg-white/50 border border-white/60 text-sm font-bold text-gray-600 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-black/5 cursor-pointer hover:bg-white transition-colors"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>

                    {/* Dynamic Bar Chart */}
                    <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2 min-h-[300px]">
                        {dataPoints.length > 0 ? (
                            dataPoints.map((val, i) => {
                                const heightPct = (val / maxVal) * 100; // Normalize height (0-100%)
                                return (
                                    <div key={i} className="w-full h-full flex items-end justify-center group relative z-0 hover:z-20">
                                        <div className="w-full mx-1 bg-white/40 rounded-2xl relative overflow-visible transition-all duration-500 flex items-end" style={{ height: '100%' }}>
                                            <div
                                                className="w-full bg-gray-900 rounded-2xl transition-all duration-700 ease-out group-hover:bg-indigo-600 relative"
                                                style={{ height: `${heightPct}%`, minHeight: '4px' }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                                            </div>
                                        </div>

                                        {/* Tooltip - Fixed Position & Z-index */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50 pointer-events-none">
                                            Rs. {val.toLocaleString()}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black"></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No data available for this period
                            </div>
                        )}
                    </div>

                    {/* Labels */}
                    <div className="flex justify-between mt-6 text-xs text-gray-400 font-bold uppercase tracking-wider px-2">
                        {activeChart.labels.map((label, i) => (
                            <span key={i} className="flex-1 text-center truncate px-1">{label}</span>
                        ))}
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
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div key={order._id} className="group flex items-center gap-4 py-3 p-3 rounded-2xl hover:bg-white/60 transition-all cursor-pointer border border-transparent hover:border-white/50 hover:shadow-sm">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-black text-xs text-gray-500 shadow-inner group-hover:from-indigo-100 group-hover:to-blue-100 group-hover:text-indigo-600 transition-colors">
                                        {order.user?.name?.[0] || "U"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-900 transition-colors truncate">{order.user?.name || "Guest"}</p>
                                        <p className="text-xs text-gray-400 font-medium truncate">Order #{order._id.slice(-6)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">Rs. {order.totalAmount.toLocaleString()}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${order.status === 'Delivered' ? 'bg-green-100/50 text-green-700 border-green-200' :
                                                order.status === 'Cancelled' ? 'bg-red-100/50 text-red-700 border-red-200' :
                                                    'bg-yellow-100/50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-10">No recent orders</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
