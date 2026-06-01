"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Zap, Flame, Plus, Trash2, ChevronUp, ChevronDown, Save } from "lucide-react";
import Loader from "@/components/admin/Loader";

const MAX = 3;

function ProductPicker({ products, selectedIds, onAdd, disabled }) {
    const [search, setSearch] = useState("");

    const available = useMemo(() => {
        const selected = new Set(selectedIds.map(String));
        return products.filter(
            (p) =>
                !selected.has(String(p._id)) &&
                p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [products, selectedIds, search]);

    return (
        <div className="space-y-2">
            <input
                type="text"
                placeholder="Search products to add..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={disabled}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black disabled:bg-gray-50"
            />
            {search && available.length > 0 && (
                <ul className="border border-gray-100 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-50">
                    {available.slice(0, 8).map((p) => (
                        <li key={p._id}>
                            <button
                                type="button"
                                onClick={() => {
                                    onAdd(p._id);
                                    setSearch("");
                                }}
                                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 text-left"
                            >
                                <div className="w-8 h-10 relative bg-gray-100 rounded overflow-hidden shrink-0">
                                    {p.images?.[0] && (
                                        <Image src={p.images[0]} fill className="object-cover" alt="" sizes="32px" />
                                    )}
                                </div>
                                <span className="text-sm font-medium truncate">{p.name}</span>
                                <Plus size={14} className="ml-auto shrink-0 text-gray-400" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function SelectedList({ items, onRemove, onMove, productMap }) {
    if (items.length === 0) {
        return (
            <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-lg">
                No products selected. Add up to {MAX} items.
            </p>
        );
    }

    return (
        <ul className="space-y-2">
            {items.map((id, idx) => {
                const p = productMap.get(String(id));
                if (!p) return null;
                return (
                    <li
                        key={id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                        <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                        <div className="w-10 h-12 relative bg-gray-200 rounded overflow-hidden shrink-0">
                            {p.images?.[0] && (
                                <Image src={p.images[0]} fill className="object-cover" alt="" sizes="40px" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-xs text-gray-500">Rs. {p.pricing?.salePrice?.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onMove(idx, -1)}
                                disabled={idx === 0}
                                className="p-1.5 rounded hover:bg-white disabled:opacity-30"
                                aria-label="Move up"
                            >
                                <ChevronUp size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onMove(idx, 1)}
                                disabled={idx === items.length - 1}
                                className="p-1.5 rounded hover:bg-white disabled:opacity-30"
                                aria-label="Move down"
                            >
                                <ChevronDown size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="p-1.5 rounded hover:bg-red-50 text-red-500"
                                aria-label="Remove"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export default function HomepageSectionsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [flashIds, setFlashIds] = useState([]);
    const [hotIds, setHotIds] = useState([]);
    const [flashEndsAt, setFlashEndsAt] = useState("");

    const productMap = useMemo(
        () => new Map(allProducts.map((p) => [String(p._id), p])),
        [allProducts]
    );

    useEffect(() => {
        async function load() {
            try {
                const [sectionsRes, productsRes] = await Promise.all([
                    fetch("/api/admin/homepage-sections"),
                    fetch("/api/products?limit=200"),
                ]);

                const sections = await sectionsRes.json();
                const productsData = await productsRes.json();

                if (productsData.products) setAllProducts(productsData.products);

                if (sectionsRes.ok) {
                    setFlashIds((sections.flashSaleProducts || []).map((p) => p._id));
                    setHotIds((sections.hotDropProducts || []).map((p) => p._id));
                    if (sections.flashSaleEndsAt) {
                        const d = new Date(sections.flashSaleEndsAt);
                        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16);
                        setFlashEndsAt(local);
                    }
                }
            } catch {
                toast.error("Failed to load homepage sections");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const moveItem = (setter) => (idx, dir) => {
        setter((prev) => {
            const next = [...prev];
            const target = idx + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[idx], next[target]] = [next[target], next[idx]];
            return next;
        });
    };

    const addItem = (setter) => (id) => {
        setter((prev) => {
            if (prev.length >= MAX || prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    const removeItem = (setter) => (idx) => {
        setter((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        setSaving(true);
        const toastId = toast.loading("Saving...");
        try {
            const res = await fetch("/api/admin/homepage-sections", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    flashSaleProductIds: flashIds,
                    hotDropProductIds: hotIds,
                    flashSaleEndsAt: flashEndsAt || null,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Homepage sections saved!", { id: toastId });
            } else {
                toast.error(data.error || "Failed to save", { id: toastId });
            }
        } catch {
            toast.error("Failed to save", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Choose which products appear in Flash Sale and Hot Drop on the homepage (max {MAX} each).
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Flash Sale */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#005AD8] text-white p-1.5 rounded">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Flash Sale</h2>
                            <p className="text-xs text-gray-500">Left block on homepage</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                            Sale ends at (optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={flashEndsAt}
                            onChange={(e) => setFlashEndsAt(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <SelectedList
                        items={flashIds}
                        productMap={productMap}
                        onRemove={removeItem(setFlashIds)}
                        onMove={moveItem(setFlashIds)}
                    />

                    {flashIds.length < MAX && (
                        <ProductPicker
                            products={allProducts}
                            selectedIds={flashIds}
                            onAdd={addItem(setFlashIds)}
                            disabled={flashIds.length >= MAX}
                        />
                    )}
                </div>

                {/* Hot Drop */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-100 text-orange-600 p-1.5 rounded">
                            <Flame size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Hot Drop</h2>
                            <p className="text-xs text-gray-500">Right block on homepage</p>
                        </div>
                    </div>

                    <SelectedList
                        items={hotIds}
                        productMap={productMap}
                        onRemove={removeItem(setHotIds)}
                        onMove={moveItem(setHotIds)}
                    />

                    {hotIds.length < MAX && (
                        <ProductPicker
                            products={allProducts}
                            selectedIds={hotIds}
                            onAdd={addItem(setHotIds)}
                            disabled={hotIds.length >= MAX}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
