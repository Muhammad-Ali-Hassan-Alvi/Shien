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

const INPUT_CLASS =
    "w-full pl-9 pr-3 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 tabular-nums shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400";

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

    const sliderMin = draftMin === "" ? lo : Math.min(Math.max(Number(draftMin), lo), hi);
    const sliderMax = draftMax === "" ? hi : Math.min(Math.max(Number(draftMax), lo), hi);

    const apply = () => {
        let min = draftMin === "" ? "" : String(Math.max(Number(draftMin), 0));
        let max = draftMax === "" ? "" : String(Math.max(Number(draftMax), 0));
        if (min !== "" && max !== "" && Number(min) > Number(max)) {
            [min, max] = [max, min];
        }
        onApply(min, max);
    };

    return (
        <div className="space-y-4">
            <p className="text-xs text-gray-500">
                Products from Rs. {lo.toLocaleString()} to Rs. {hi.toLocaleString()}
            </p>

            <div className="space-y-2">
                <label htmlFor="price-filter-min" className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Minimum
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-semibold pointer-events-none">
                        Rs.
                    </span>
                    <input
                        id="price-filter-min"
                        type="text"
                        inputMode="numeric"
                        placeholder={lo.toLocaleString()}
                        value={formatDisplayPrice(draftMin)}
                        onChange={(e) => setDraftMin(parsePriceInput(e.target.value))}
                        className={INPUT_CLASS}
                    />
                </div>
                <input
                    type="range"
                    min={lo}
                    max={hi}
                    step={Math.max(1, Math.round((hi - lo) / 200))}
                    value={sliderMin}
                    onChange={(e) => setDraftMin(e.target.value)}
                    className="w-full h-2 accent-gray-900 cursor-pointer"
                    aria-label="Minimum price slider"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="price-filter-max" className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Maximum
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-semibold pointer-events-none">
                        Rs.
                    </span>
                    <input
                        id="price-filter-max"
                        type="text"
                        inputMode="numeric"
                        placeholder="No limit"
                        value={formatDisplayPrice(draftMax)}
                        onChange={(e) => setDraftMax(parsePriceInput(e.target.value))}
                        className={INPUT_CLASS}
                    />
                </div>
                <p className="text-[10px] text-gray-400">Leave empty for no maximum. Slider goes up to Rs. {hi.toLocaleString()}.</p>
                <input
                    type="range"
                    min={lo}
                    max={hi}
                    step={Math.max(1, Math.round((hi - lo) / 200))}
                    value={sliderMax}
                    onChange={(e) => setDraftMax(e.target.value)}
                    className="w-full h-2 accent-gray-900 cursor-pointer"
                    aria-label="Maximum price slider"
                />
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
