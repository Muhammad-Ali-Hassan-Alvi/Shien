"use client";

import { useMemo, useState } from "react";
import StatsCard from "@/components/admin/StatsCard";
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react";
import Link from "next/link";
import DateRangePicker from "@/components/ui/DateRangePicker";
import {
    buildRevenueChart,
    getPresetRange,
    parseDateRange,
    toDateInputValue,
} from "@/app/lib/chartUtils";

export default function DashboardClient({ stats, recentOrders, allOrders = [] }) {
    const defaultRange = getPresetRange("week");
    const [rangePreset, setRangePreset] = useState("week");
    const [startDate, setStartDate] = useState(toDateInputValue(defaultRange.start));
    const [endDate, setEndDate] = useState(toDateInputValue(defaultRange.end));

    const orders = allOrders.length ? allOrders : recentOrders;

    const activeChart = useMemo(() => {
        const parsed = parseDateRange(startDate, endDate);
        if (!parsed) {
            return { data: [], labels: [], total: 0 };
        }
        return buildRevenueChart(orders, parsed.start, parsed.end);
    }, [orders, startDate, endDate]);

    const handleRangeChange = ({ preset, startDate: start, endDate: end }) => {
        setRangePreset(preset);
        setStartDate(start);
        setEndDate(end);
    };

    const exportReport = () => {
        const parsed = parseDateRange(startDate, endDate);
        const rows = orders
            .filter((o) => {
                if (!parsed) return true;
                const d = new Date(o.createdAt);
                return d >= parsed.start && d <= parsed.end;
            })
            .map((o) => ({
                id: o._id,
                date: o.createdAt,
                status: o.status,
                total: o.totalAmount,
                customer: o.user?.email || o.user?.name || "Guest",
            }));

        if (!rows.length) return;

        const header = "Order ID,Date,Status,Total (Rs),Customer\n";
        const body = rows
            .map((r) =>
                `${r.id},${r.date},${r.status},${r.total},"${String(r.customer).replace(/"/g, '""')}"`
            )
            .join("\n");
        const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `imart-orders-${startDate}-to-${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const dataPoints = activeChart?.data || [];
    const maxVal = Math.max(...dataPoints, 1);

    return (
        <div className="space-y-6 sm:space-y-8 relative pb-8 sm:pb-12">
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm bg-white/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
                    <button
                        type="button"
                        onClick={exportReport}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-white/50 backdrop-blur-md border border-white/60 text-sm font-bold text-gray-700 rounded-xl hover:bg-white hover:shadow-lg transition-all active:scale-95"
                    >
                        Export Report
                    </button>
                    <Link
                        href="/seller-center/products/new"
                        className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-black/90 backdrop-blur-md text-white text-sm font-bold rounded-xl hover:bg-black hover:shadow-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <span>+</span> Add Product
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`Rs. ${stats.revenue.toLocaleString()}`}
                    trend="up"
                    trendValue="+20.1%"
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6 sm:mb-8">
                        <div>
                            <h3 className="font-playfair font-bold text-lg sm:text-xl text-gray-900">Revenue Analytics</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">
                                Performance over time
                                {activeChart.total > 0 && (
                                    <span className="ml-2 text-gray-700 font-bold">
                                        · Rs. {activeChart.total.toLocaleString()}
                                    </span>
                                )}
                            </p>
                        </div>
                        <DateRangePicker
                            preset={rangePreset}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleRangeChange}
                        />
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-2 pb-2 min-h-[200px] sm:min-h-[280px] lg:min-h-[300px] overflow-x-auto">
                        {dataPoints.length > 0 ? (
                            dataPoints.map((val, i) => {
                                const heightPct = (val / maxVal) * 100;
                                return (
                                    <div key={i} className="w-full h-full flex items-end justify-center group relative z-0 hover:z-20">
                                        <div className="w-full mx-1 bg-white/40 rounded-2xl relative overflow-visible transition-all duration-500 flex items-end" style={{ height: "100%" }}>
                                            <div
                                                className="w-full bg-gray-900 rounded-2xl transition-all duration-700 ease-out group-hover:bg-indigo-600 relative"
                                                style={{ height: `${heightPct}%`, minHeight: "4px" }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                                            </div>
                                        </div>

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

                    <div className="flex justify-between mt-4 sm:mt-6 text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider px-1 sm:px-2 gap-1 min-w-0">
                        {activeChart.labels.map((label, i) => (
                            <span key={i} className="flex-1 text-center truncate px-0.5">{label}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-w-0 lg:min-h-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                        <div>
                            <h3 className="font-playfair font-bold text-lg sm:text-xl text-gray-900">Recent Orders</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Latest transactions</p>
                        </div>
                        <Link
                            href="/seller-center/orders"
                            className="w-full sm:w-auto text-center px-4 py-2 bg-white/60 backdrop-blur-md border border-white/60 rounded-lg text-xs font-bold text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all uppercase tracking-wider shadow-sm"
                        >
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3 p-3 rounded-2xl hover:bg-white/60 transition-all cursor-pointer border border-transparent hover:border-white/50 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-black text-xs text-gray-500 shrink-0">
                                            {order.user?.name?.[0] || "U"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{order.user?.name || "Guest"}</p>
                                            <p className="text-xs text-gray-400 font-medium truncate">Order #{order._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:text-right w-full sm:w-auto">
                                        <p className="text-sm font-bold text-gray-900">Rs. {order.totalAmount.toLocaleString()}</p>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border whitespace-nowrap ${
                                                order.status === "Delivered"
                                                    ? "bg-green-100/50 text-green-700 border-green-200"
                                                    : order.status === "Cancelled"
                                                      ? "bg-red-100/50 text-red-700 border-red-200"
                                                      : "bg-yellow-100/50 text-yellow-700 border-yellow-200"
                                            }`}
                                        >
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
