"use client";

import { DollarSign, ShoppingBag, TrendingUp, Calendar } from "lucide-react";
import { useMemo, useState } from "react";
import {
    buildRevenueChart,
    parseDateRange,
    toDateInputValue,
} from "@/app/lib/chartUtils";

const PRESET_DAYS = [7, 30, 90];

function getLastNDaysRange(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    return {
        startDate: toDateInputValue(start),
        endDate: toDateInputValue(end),
    };
}

export default function AnalyticsDashboard({ orders }) {
    const defaultRange = getLastNDaysRange(7);
    const [preset, setPreset] = useState("7");
    const [startDate, setStartDate] = useState(defaultRange.startDate);
    const [endDate, setEndDate] = useState(defaultRange.endDate);
    const [localStart, setLocalStart] = useState(defaultRange.startDate);
    const [localEnd, setLocalEnd] = useState(defaultRange.endDate);
    const [barWidth, setBarWidth] = useState(40);

    const activeOrders = useMemo(
        () => orders.filter((o) => o.status !== "Cancelled"),
        [orders]
    );

    const analytics = useMemo(() => {
        const parsed = parseDateRange(startDate, endDate);
        if (!parsed) {
            return {
                totalRevenue: 0,
                totalOrders: 0,
                aov: 0,
                chartData: [],
            };
        }

        const filtered = activeOrders.filter((o) => {
            const d = new Date(o.createdAt);
            return d >= parsed.start && d <= parsed.end;
        });

        const chart = buildRevenueChart(filtered, parsed.start, parsed.end);
        const chartData = chart.labels.map((label, i) => ({
            label,
            value: chart.data[i] || 0,
        }));

        const totalRevenue = filtered.reduce((acc, o) => acc + o.totalAmount, 0);
        const totalOrders = filtered.length;
        const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        return { totalRevenue, totalOrders, aov, chartData };
    }, [activeOrders, startDate, endDate]);

    const maxVal = Math.max(...analytics.chartData.map((d) => d.value), 100);

    const applyPreset = (days) => {
        const range = getLastNDaysRange(days);
        setPreset(String(days));
        setStartDate(range.startDate);
        setEndDate(range.endDate);
        setLocalStart(range.startDate);
        setLocalEnd(range.endDate);
    };

    const applyCustomRange = () => {
        if (!localStart || !localEnd || localEnd < localStart) return;
        setPreset("custom");
        setStartDate(localStart);
        setEndDate(localEnd);
    };

    const rangeLabel =
        startDate && endDate
            ? `${new Date(startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} – ${new Date(endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
            : "";

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-stretch sm:items-center gap-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto">
                        {PRESET_DAYS.map((days) => (
                            <button
                                key={days}
                                type="button"
                                onClick={() => applyPreset(days)}
                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${
                                    preset === String(days)
                                        ? "bg-black text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                Last {days} Days
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setPreset("custom")}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${
                                preset === "custom"
                                    ? "bg-black text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Custom Range
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto min-w-0">
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

                {preset === "custom" && (
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3 max-w-xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <Calendar size={14} />
                            Select custom dates
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">From</span>
                                <input
                                    type="date"
                                    value={localStart}
                                    max={localEnd || undefined}
                                    onChange={(e) => setLocalStart(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                />
                            </label>
                            <label className="block">
                                <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">To</span>
                                <input
                                    type="date"
                                    value={localEnd}
                                    min={localStart || undefined}
                                    max={toDateInputValue(new Date())}
                                    onChange={(e) => setLocalEnd(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                />
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={applyCustomRange}
                            disabled={!localStart || !localEnd || localEnd < localStart}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Apply Range
                        </button>
                    </div>
                )}

                {rangeLabel && (
                    <p className="text-xs text-gray-400 font-medium">{rangeLabel}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={`Rs. ${analytics.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <KPICard
                    title="Total Orders"
                    value={analytics.totalOrders}
                    icon={ShoppingBag}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <KPICard
                    title="Avg. Order Value"
                    value={`Rs. ${analytics.aov.toLocaleString()}`}
                    icon={TrendingUp}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
            </div>

            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm w-full max-w-full min-w-0 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Sales Trend</h3>
                </div>

                {analytics.chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                        No sales data for this period
                    </div>
                ) : (
                    <div className="relative w-full">
                        <div className="overflow-x-auto pb-4 w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                            <div
                                className="h-96 flex items-end gap-2 pl-12 pr-4 relative pt-12"
                                style={{ minWidth: analytics.chartData.length * (barWidth + 10) }}
                            >
                                <div className="sticky left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-2 bg-white/90 backdrop-blur-sm z-10 pr-4 border-r border-gray-50 h-full w-12 text-right">
                                    <span>{formatCompact(maxVal)}</span>
                                    <span>{formatCompact(maxVal / 2)}</span>
                                    <span>0</span>
                                </div>

                                {analytics.chartData.map((d) => (
                                    <div
                                        key={d.label}
                                        className="relative flex flex-col items-center group h-full justify-end transition-all duration-300"
                                        style={{ flex: `0 0 ${barWidth}px` }}
                                    >
                                        <div
                                            className="w-full bg-black rounded-t-sm opacity-80 hover:opacity-100 transition-all relative group-hover:shadow-lg"
                                            style={{
                                                height: `${Math.max((d.value / maxVal) * 100, 1)}%`,
                                            }}
                                        >
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none shadow-xl transition-opacity">
                                                Rs. {d.value.toLocaleString()}
                                                <div className="text-[10px] text-gray-400">{d.label}</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-2 w-full text-center truncate px-1">
                                            {d.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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
    return Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(num);
}
