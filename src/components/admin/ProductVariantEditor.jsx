"use client";

import { Plus, Trash2 } from "lucide-react";
import { DEFAULT_VARIANT_SETTINGS } from "@/app/lib/categoryUtils";

const inputClass = "w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-black";

export default function ProductVariantEditor({ variantConfig, rows, onChange }) {
    const supportsSizes = variantConfig?.supportsSizes !== false;
    const supportsColors = variantConfig?.supportsColors !== false;
    const sizeOptions =
        variantConfig?.sizeOptions?.length > 0
            ? variantConfig.sizeOptions
            : DEFAULT_VARIANT_SETTINGS.sizeOptions;

    const stockOnly = !supportsSizes && !supportsColors;
    const sizesOnly = supportsSizes && !supportsColors;
    const colorsOnly = supportsColors && !supportsSizes;

    const updateRow = (index, field, value) => {
        onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    const addRow = () => {
        onChange([
            ...rows,
            {
                color: colorsOnly || (supportsSizes && supportsColors) ? "" : "Default",
                size: sizesOnly ? sizeOptions[0] || "M" : "One Size",
                stock: 0,
            },
        ]);
    };

    const removeRow = (index) => {
        if (rows.length <= 1) return;
        onChange(rows.filter((_, i) => i !== index));
    };

    if (stockOnly) {
        return (
            <div>
                <label className="block text-sm font-bold mb-2">Stock quantity</label>
                <input
                    type="number"
                    min={0}
                    value={rows[0]?.stock ?? 0}
                    onChange={(e) => updateRow(0, "stock", e.target.value)}
                    className={inputClass}
                />
            </div>
        );
    }

    if (sizesOnly) {
        return (
            <div className="space-y-3">
                <label className="block text-sm font-bold">Stock by size</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="text-left px-3 py-2 font-medium">Size</th>
                                <th className="text-left px-3 py-2 font-medium">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row, index) => (
                                <tr key={`${row.size}-${index}`}>
                                    <td className="px-3 py-2 font-medium text-gray-800">{row.size}</td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            min={0}
                                            value={row.stock}
                                            onChange={(e) => updateRow(index, "stock", e.target.value)}
                                            className={inputClass}
                                            placeholder="0"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-gray-500">Leave 0 for sizes you do not sell.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <label className="block text-sm font-bold">
                    {colorsOnly ? "Colors & stock" : "Variants (color, size, stock)"}
                </label>
                <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black"
                >
                    <Plus size={14} /> Add {colorsOnly ? "color" : "variant"}
                </button>
            </div>

            <div className="space-y-2">
                {rows.map((row, index) => (
                    <div
                        key={index}
                        className="flex flex-wrap items-end gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                        {(colorsOnly || (supportsSizes && supportsColors)) && (
                            <div className="flex-1 min-w-[120px]">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    value={row.color}
                                    onChange={(e) => updateRow(index, "color", e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Black, White"
                                    required
                                />
                            </div>
                        )}
                        {supportsSizes && supportsColors && (
                            <div className="w-24 shrink-0">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                    Size
                                </label>
                                <select
                                    value={row.size}
                                    onChange={(e) => updateRow(index, "size", e.target.value)}
                                    className={inputClass}
                                >
                                    {sizeOptions.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="w-24 shrink-0">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                Stock
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={row.stock}
                                onChange={(e) => updateRow(index, "stock", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {rows.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Remove variant"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
