"use client";

import { DollarSign, ShoppingBag, TrendingUp, Calendar } from "lucide-react";
import { useMemo, useState } from "react";

export default function AnalyticsDashboard({ orders }) {
    const [timeRange, setTimeRange] = useState(7); // days
    const [barWidth, setBarWidth] = useState(40); // User adjustable column size

    // ... Filter Logic & Stats Calculations (SAME)
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - timeRange);
        return orders.filter(o => new Date(o.createdAt) >= cutoff && o.status !== 'Cancelled');
    }, [orders, timeRange]);

    const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const chartData = useMemo(() => {
        const data = {};
        for (let i = timeRange - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            data[key] = 0;
        }
        filteredOrders.forEach(o => {
            const key = new Date(o.createdAt).toISOString().split('T')[0];
            if (data[key] !== undefined) data[key] += o.totalAmount;
        });
        return Object.entries(data).map(([date, value]) => ({ date, value }));
    }, [filteredOrders, timeRange]);

    const maxVal = Math.max(...chartData.map(d => d.value), 100);

    return (
        <div className="space-y-8">
            {/* Header Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${timeRange === days ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Last {days} Days
                        </button>
                    ))}
                </div>

                {/* Column Size Control */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold uppercase text-gray-500">Column Size</span>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={barWidth}
                        onChange={(e) => setBarWidth(Number(e.target.value))}
                        className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-600" bg="bg-green-50" />
                <KPICard title="Total Orders" value={totalOrders} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" />
                <KPICard title="Avg. Order Value" value={`Rs. ${aov.toLocaleString()}`} icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" />
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm w-full max-w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Sales Trend</h3>
                </div>

                <div className="relative w-full">
                    <div className="overflow-x-auto pb-4 w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                        <div
                            className="h-96 flex items-end gap-2 pl-12 pr-4 relative pt-12"
                            style={{ minWidth: chartData.length * (barWidth + 10) }} /* Dynamic Grid Width */
                        >
                            {/* Floating Y-Axis Labels (Fixed Position Mock via Sticky) */}
                            <div className="sticky left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-2 bg-white/90 backdrop-blur-sm z-10 pr-4 border-r border-gray-50 h-full w-12 text-right">
                                <span>{formatCompact(maxVal)}</span>
                                <span>{formatCompact(maxVal / 2)}</span>
                                <span>0</span>
                            </div>

                            {/* Bars */}
                            {chartData.map((d, i) => (
                                <div
                                    key={d.date}
                                    className="relative flex flex-col items-center group h-full justify-end transition-all duration-300"
                                    style={{ flex: `0 0 ${barWidth}px` }} /* Fixed width based on slider */
                                >
                                    <div
                                        className="w-full bg-black rounded-t-sm opacity-80 hover:opacity-100 transition-all relative group-hover:shadow-lg"
                                        style={{ height: `${Math.max((d.value / maxVal) * 100, 1)}%` }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none shadow-xl transition-opacity">
                                            Rs. {d.value.toLocaleString()}
                                            <div className="text-[10px] text-gray-400">{d.date}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-2 w-full text-center truncate px-1">
                                        {new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <p className="text-2xl font-bold font-playfair">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${bg} ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

function formatCompact(num) {
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
}
