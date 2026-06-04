"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import {
    resolveEffectiveVariantSettings,
    flattenCategoriesFlat,
    DEFAULT_VARIANT_SETTINGS,
} from "@/app/lib/categoryUtils";

export default function CategoryUpdateModal({
    isOpen,
    onClose,
    category,
    categoryTree = [],
    onUpdate,
    onRemoveProduct,
}) {
    const [newName, setNewName] = useState("");
    const [showInNav, setShowInNav] = useState(true);
    const [isActive, setIsActive] = useState(true);
    const [isLine, setIsLine] = useState(false);
    const [supportsSizes, setSupportsSizes] = useState(true);
    const [supportsColors, setSupportsColors] = useState(true);
    const [sizeOptionsText, setSizeOptionsText] = useState("XS, S, M, L, XL");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const isRootCategory = !category?.parent;

    const flatCategories = useMemo(
        () => flattenCategoriesFlat(categoryTree),
        [categoryTree]
    );

    const inheritedSettings = useMemo(() => {
        if (!category || !flatCategories.length) {
            return { ...DEFAULT_VARIANT_SETTINGS, inheritedFrom: "store default" };
        }
        if (!category.parent) {
            return { ...DEFAULT_VARIANT_SETTINGS, inheritedFrom: "store default" };
        }
        const parent = flatCategories.find((c) => String(c._id) === String(category.parent));
        if (!parent) return { ...DEFAULT_VARIANT_SETTINGS, inheritedFrom: "store default" };
        return resolveEffectiveVariantSettings(flatCategories, parent.name);
    }, [category, flatCategories]);

    useEffect(() => {
        if (isOpen && category) {
            setNewName(category.name);
            setShowInNav(category.showInNav !== false);
            setIsActive(category.isActive !== false);
            setIsLine(category.isLine === true);

            const effective = resolveEffectiveVariantSettings(flatCategories, category.name);
            const usesOwnSettings = category.customVariantSettings === true;

            setSupportsSizes(
                usesOwnSettings ? category.supportsSizes !== false : effective.supportsSizes !== false
            );
            setSupportsColors(
                usesOwnSettings ? category.supportsColors !== false : effective.supportsColors !== false
            );
            setSizeOptionsText(
                (
                    usesOwnSettings && category.sizeOptions?.length
                        ? category.sizeOptions
                        : effective.sizeOptions?.length
                          ? effective.sizeOptions
                          : DEFAULT_VARIANT_SETTINGS.sizeOptions
                ).join(", ")
            );
            fetchProducts(category.name);
        }
    }, [isOpen, category, flatCategories]);

    const fetchProducts = async (catName) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?category=${encodeURIComponent(catName)}&limit=100`);
            const data = await res.json();
            if (data.products) setProducts(data.products);
        } catch {
            console.error("Failed to fetch category products");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const updates = {};
        if (newName.trim() && newName !== category.name) updates.name = newName.trim();
        if (showInNav !== category.showInNav) updates.showInNav = showInNav;
        if (isActive !== category.isActive) updates.isActive = isActive;
        if (isRootCategory && isLine !== category.isLine) updates.isLine = isLine;

        const parsedSizes = sizeOptionsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const baseline =
            category.customVariantSettings === true
                ? {
                      supportsSizes: category.supportsSizes !== false,
                      supportsColors: category.supportsColors !== false,
                      sizeOptions: category.sizeOptions?.length
                          ? category.sizeOptions
                          : DEFAULT_VARIANT_SETTINGS.sizeOptions,
                  }
                : resolveEffectiveVariantSettings(flatCategories, category.name);

        const variantChanged =
            supportsSizes !== baseline.supportsSizes ||
            supportsColors !== baseline.supportsColors ||
            (supportsSizes &&
                JSON.stringify(parsedSizes) !==
                    JSON.stringify(baseline.sizeOptions || DEFAULT_VARIANT_SETTINGS.sizeOptions));

        if (variantChanged) {
            updates.customVariantSettings = true;
            updates.supportsSizes = supportsSizes;
            updates.supportsColors = supportsColors;
            updates.sizeOptions = supportsSizes ? parsedSizes : [];
        }

        if (Object.keys(updates).length === 0) return;
        await onUpdate(category._id, updates);
    };

    const effectivePreview = {
        supportsSizes,
        supportsColors,
        sizeOptions: supportsSizes
            ? sizeOptionsText
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [],
        inheritedFrom: category?.name,
    };

    const initialEffective = useMemo(() => {
        if (!category || !flatCategories.length) return DEFAULT_VARIANT_SETTINGS;
        if (category.customVariantSettings === true) {
            return {
                supportsSizes: category.supportsSizes !== false,
                supportsColors: category.supportsColors !== false,
                sizeOptions: category.sizeOptions?.length
                    ? category.sizeOptions
                    : DEFAULT_VARIANT_SETTINGS.sizeOptions,
            };
        }
        return resolveEffectiveVariantSettings(flatCategories, category.name);
    }, [category, flatCategories]);

    const hasChanges =
        newName !== category?.name ||
        showInNav !== (category?.showInNav !== false) ||
        isActive !== (category?.isActive !== false) ||
        (isRootCategory && isLine !== (category?.isLine === true)) ||
        supportsSizes !== initialEffective.supportsSizes ||
        supportsColors !== initialEffective.supportsColors ||
        (supportsSizes &&
            sizeOptionsText !==
                (initialEffective.sizeOptions || DEFAULT_VARIANT_SETTINGS.sizeOptions).join(", "));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold">Manage Category: {category?.name}</h2>
                    <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Category Name</label>
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                                placeholder="Enter name"
                            />
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showInNav}
                                    onChange={(e) => setShowInNav(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">Show in top navbar</span>
                            </label>
                            <p className="text-xs text-gray-500 w-full -mt-2 pl-6">
                                Uncheck to hide from the header menu only. Active subcategories still appear in the ☰
                                hamburger under Shop by Category.
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            {isRootCategory && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isLine}
                                        onChange={(e) => setIsLine(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Show as Line (Woman, Man, Fragrances style)
                                    </span>
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-900">Product page options</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Choose what shoppers see on the product page. Subcategories inherit from the nearest
                                parent that has its own settings saved.
                            </p>
                        </div>

                        {!category?.customVariantSettings && category?.parent && (
                            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                Currently inheriting from{" "}
                                <strong>{inheritedSettings.inheritedFrom || "store default"}</strong>:{" "}
                                {inheritedSettings.supportsSizes ? "sizes" : "no sizes"},{" "}
                                {inheritedSettings.supportsColors ? "colors" : "no colors"}
                                {inheritedSettings.supportsSizes &&
                                    ` (${(inheritedSettings.sizeOptions || []).join(", ")})`}
                            </div>
                        )}

                        <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={supportsSizes}
                                    onChange={(e) => setSupportsSizes(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Show size selector on product page</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={supportsColors}
                                    onChange={(e) => setSupportsColors(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Show color selector on product page</span>
                            </label>
                            {supportsSizes && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">
                                        Size options (comma-separated)
                                    </label>
                                    <input
                                        value={sizeOptionsText}
                                        onChange={(e) => setSizeOptionsText(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-black"
                                        placeholder="XS, S, M, L, XL"
                                    />
                                </div>
                            )}
                            {!supportsSizes && !supportsColors && (
                                <p className="text-xs text-gray-500">
                                    Stock only — ideal for electronics, accessories, and single-SKU items.
                                </p>
                            )}
                        </div>

                        <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                            Shop preview for products in <strong>{category?.name}</strong>:{" "}
                            {!effectivePreview.supportsSizes && !effectivePreview.supportsColors
                                ? "quantity only (ideal for electronics)"
                                : [
                                      effectivePreview.supportsSizes ? "size picker" : null,
                                      effectivePreview.supportsColors ? "color picker" : null,
                                      "quantity",
                                  ]
                                      .filter(Boolean)
                                      .join(" + ")}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
                        disabled={!hasChanges}
                    >
                        Save Changes
                    </button>

                    <div>
                        <h3 className="font-bold mb-3 flex items-center justify-between">
                            <span>Products in this Category</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                                {products.length}
                            </span>
                        </h3>

                        <div className="bg-white border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading products...</div>
                            ) : products.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">No products found in this category.</div>
                            ) : (
                                products.map((p) => (
                                    <div
                                        key={p._id}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0 relative border border-gray-200 overflow-hidden">
                                                {p.images?.[0] ? (
                                                    <Image src={p.images[0]} fill className="object-cover" alt="" sizes="40px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
                                                        Img
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-500 truncate">Rs. {p.pricing?.salePrice}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                const success = await onRemoveProduct(p._id);
                                                if (success) {
                                                    setProducts((prev) => prev.filter((prod) => prod._id !== p._id));
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove from this category"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
