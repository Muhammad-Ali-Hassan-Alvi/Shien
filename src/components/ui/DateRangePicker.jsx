"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import StyledSelect from "@/components/ui/StyledSelect";
import { getPresetRange, toDateInputValue } from "@/app/lib/chartUtils";

const PRESET_OPTIONS = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
];

export default function DateRangePicker({ preset, startDate, endDate, onChange }) {
    const [localStart, setLocalStart] = useState(startDate);
    const [localEnd, setLocalEnd] = useState(endDate);

    useEffect(() => {
        setLocalStart(startDate);
        setLocalEnd(endDate);
    }, [startDate, endDate]);

    const handlePresetChange = (e) => {
        const next = e.target.value;
        if (next === "custom") {
            onChange({ preset: "custom", startDate: localStart, endDate: localEnd });
            return;
        }
        const { start, end } = getPresetRange(next);
        onChange({
            preset: next,
            startDate: toDateInputValue(start),
            endDate: toDateInputValue(end),
        });
    };

    const applyCustomRange = () => {
        if (!localStart || !localEnd) return;
        if (localEnd < localStart) return;
        onChange({ preset: "custom", startDate: localStart, endDate: localEnd });
    };

    const formatDisplayRange = () => {
        if (!startDate || !endDate) return "";
        const s = new Date(startDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        const e = new Date(endDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        return `${s} – ${e}`;
    };

    return (
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[280px]">
            <StyledSelect
                className="w-full sm:w-48"
                value={preset}
                onChange={handlePresetChange}
                options={PRESET_OPTIONS}
                aria-label="Chart date range"
            />

            {preset === "custom" && (
                <div className="p-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        <Calendar size={14} />
                        Select dates
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="block">
                            <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">From</span>
                            <input
                                type="date"
                                value={localStart}
                                max={localEnd || undefined}
                                onChange={(e) => setLocalStart(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
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
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={applyCustomRange}
                        disabled={!localStart || !localEnd || localEnd < localStart}
                        className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Apply Range
                    </button>
                </div>
            )}

            {preset !== "custom" && startDate && endDate && (
                <p className="text-[10px] text-gray-400 font-medium text-right sm:text-left">
                    {formatDisplayRange()}
                </p>
            )}
        </div>
    );
}
