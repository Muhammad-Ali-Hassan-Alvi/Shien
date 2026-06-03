"use client";

import { useEffect, useState } from "react";

function parsePriceInput(value) {
    const digits = String(value).replace(/[^\d]/g, "");
    return digits === "" ? "" : String(parseInt(digits, 10));
}

function formatDisplayPrice(value) {
    if (value === "" || value == null) return "";
    const n = Number(value);
    if (Number.isNaN(n)) return "";
    return n.toLocaleString("en-PK");
}

export default function ProductPriceFilter({
    minPrice,
    maxPrice,
    priceBounds,
    onApply,
}) {
    const lo = priceBounds?.min ?? 0;
    const hi = Math.max(priceBounds?.max ?? 100000, lo + 1);

    const [draftMin, setDraftMin] = useState(minPrice ?? "");
    const [draftMax, setDraftMax] = useState(maxPrice ?? "");

    useEffect(() => {
        setDraftMin(minPrice ?? "");
        setDraftMax(maxPrice ?? "");
    }, [minPrice, maxPrice]);

    const numMin = draftMin === "" ? lo : Math.min(Math.max(Number(draftMin), lo), hi);
    const numMax = draftMax === "" ? hi : Math.min(Math.max(Number(draftMax), lo), hi);

    const apply = () => {
        let min = draftMin === "" ? "" : String(numMin);
        let max = draftMax === "" ? "" : String(numMax);
        if (min !== "" && max !== "" && Number(min) > Number(max)) {
            [min, max] = [max, min];
        }
        onApply(min, max);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Rs. {lo.toLocaleString()}</span>
                <span>Rs. {hi.toLocaleString()}</span>
            </div>

            <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600">Minimum</label>
                <input
                    type="range"
                    min={lo}
                    max={hi}
                    step={Math.max(1, Math.round((hi - lo) / 200))}
                    value={numMin}
                    onChange={(e) => setDraftMin(e.target.value)}
                    className="w-full h-2 accent-gray-900 cursor-pointer"
                />
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                        Rs.
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder={lo.toLocaleString()}
                        value={formatDisplayPrice(draftMin)}
                        onChange={(e) => setDraftMin(parsePriceInput(e.target.value))}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm tabular-nums outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600">Maximum</label>
                <input
                    type="range"
                    min={lo}
                    max={hi}
                    step={Math.max(1, Math.round((hi - lo) / 200))}
                    value={numMax}
                    onChange={(e) => setDraftMax(e.target.value)}
                    className="w-full h-2 accent-gray-900 cursor-pointer"
                />
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                        Rs.
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder={hi.toLocaleString()}
                        value={formatDisplayPrice(draftMax)}
                        onChange={(e) => setDraftMax(parsePriceInput(e.target.value))}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm tabular-nums outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={apply}
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
                Apply price
            </button>
        </div>
    );
}
