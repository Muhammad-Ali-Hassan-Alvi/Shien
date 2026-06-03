"use client";

import { useEffect, useMemo, useState } from "react";
import { X, FolderInput } from "lucide-react";
import StyledSelect from "@/components/ui/StyledSelect";
import { buildCategorySelectOptions } from "@/app/lib/categoryUtils";

export default function MoveCategoryModal({
    isOpen,
    onClose,
    products = [],
    categoryTree = [],
    onConfirm,
}) {
    const [targetCategory, setTargetCategory] = useState("");
    const [saving, setSaving] = useState(false);

    const options = useMemo(
        () => buildCategorySelectOptions(categoryTree, { includeInactive: false }),
        [categoryTree]
    );

    const currentCategory = products.length === 1 ? products[0]?.category : "";

    useEffect(() => {
        if (!isOpen) return;
        setTargetCategory(products.length === 1 ? products[0]?.category || "" : "");
        setSaving(false);
    }, [isOpen, products]);

    if (!isOpen || products.length === 0) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!targetCategory) return;
        setSaving(true);
        try {
            await onConfirm(targetCategory);
        } finally {
            setSaving(false);
        }
    };

    const count = products.length;
    const unchanged =
        count === 1 && targetCategory === currentCategory;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <FolderInput size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {count === 1 ? "Move product" : `Move ${count} products`}
                            </h3>
                            <p className="text-xs text-gray-500">Choose category or subcategory</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {count === 1 ? (
                        <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">{products[0].name}</span>
                            {currentCategory && (
                                <>
                                    {" "}
                                    — currently in{" "}
                                    <span className="font-medium">{currentCategory}</span>
                                </>
                            )}
                        </p>
                    ) : (
                        <ul className="text-xs text-gray-500 max-h-24 overflow-y-auto space-y-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            {products.slice(0, 8).map((p) => (
                                <li key={p._id} className="truncate">
                                    {p.name}
                                </li>
                            ))}
                            {count > 8 && (
                                <li className="text-gray-400">+ {count - 8} more</li>
                            )}
                        </ul>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Move to
                        </label>
                        <StyledSelect
                            className="w-full"
                            value={targetCategory}
                            onChange={(e) => setTargetCategory(e.target.value)}
                            options={[
                                { value: "", label: "Select category…" },
                                ...options,
                            ]}
                            aria-label="Target category"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !targetCategory || unchanged}
                            className="flex-1 py-3 px-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {saving ? "Moving…" : "Move"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
