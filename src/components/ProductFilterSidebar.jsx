"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import ProductPriceFilter from "@/components/ProductPriceFilter";

function CategoryTreeFilter({ nodes, activeCategory, onSelect, depth = 0 }) {
    const [expanded, setExpanded] = useState(() => {
        const init = new Set();
        const expandActive = (items) => {
            for (const node of items) {
                if (
                    node.name.toLowerCase() === activeCategory?.toLowerCase() ||
                    node.slug?.toLowerCase() === activeCategory?.toLowerCase()
                ) {
                    init.add(node._id);
                }
                if (node.children?.length) expandActive(node.children);
            }
        };
        expandActive(nodes);
        return init;
    });

    const toggle = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <ul className="space-y-0.5">
            {nodes.map((node) => {
                const hasChildren = node.children?.length > 0;
                const isActive =
                    activeCategory?.toLowerCase() === node.name.toLowerCase() ||
                    activeCategory?.toLowerCase() === node.slug?.toLowerCase();
                const isOpen = expanded.has(node._id);

                return (
                    <li key={node._id}>
                        <div
                            className="flex items-center"
                            style={{ paddingLeft: `${depth * 12}px` }}
                        >
                            {hasChildren ? (
                                <button
                                    type="button"
                                    onClick={() => toggle(node._id)}
                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0"
                                    aria-label={isOpen ? "Collapse" : "Expand"}
                                >
                                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            ) : (
                                <span className="w-6 shrink-0" />
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    if (hasChildren) {
                                        toggle(node._id);
                                        return;
                                    }
                                    onSelect(node.name);
                                }}
                                className={`flex-1 text-left py-1.5 px-2 rounded-md text-sm transition-colors ${
                                    isActive
                                        ? "bg-gray-900 text-white font-semibold"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                {node.name}
                            </button>
                        </div>
                        {hasChildren && isOpen && (
                            <div className="mt-0.5">
                                <button
                                    type="button"
                                    onClick={() => onSelect(node.name)}
                                    className={`block w-full text-left py-1.5 px-2 rounded-md text-xs font-semibold transition-colors mb-1 ${
                                        isActive
                                            ? "text-gray-900"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                    style={{ paddingLeft: `${depth * 12 + 28}px` }}
                                >
                                    All {node.name}
                                </button>
                                <CategoryTreeFilter
                                    nodes={node.children}
                                    activeCategory={activeCategory}
                                    onSelect={onSelect}
                                    depth={depth + 1}
                                />
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

export default function ProductFilterSidebar({
    categoryTree,
    activeCategory,
    minPrice,
    maxPrice,
    onCategoryChange,
    onPriceApply,
    priceBounds,
    onClear,
    mobileOpen,
    onMobileClose,
}) {
    const sidebarContent = (
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Category</h3>
                    {activeCategory && (
                        <button
                            type="button"
                            onClick={() => onCategoryChange("")}
                            className="text-xs text-gray-500 hover:text-gray-900 underline"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => onCategoryChange("")}
                    className={`w-full text-left py-2 px-3 rounded-md text-sm mb-2 transition-colors ${
                        !activeCategory
                            ? "bg-gray-900 text-white font-semibold"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    All Products
                </button>
                {categoryTree.length > 0 ? (
                    <CategoryTreeFilter
                        nodes={categoryTree}
                        activeCategory={activeCategory}
                        onSelect={onCategoryChange}
                    />
                ) : (
                    <p className="text-sm text-gray-400 py-2">No categories yet</p>
                )}
            </div>

            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">Price</h3>
                {priceBounds ? (
                    <ProductPriceFilter
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        priceBounds={priceBounds}
                        onApply={onPriceApply}
                    />
                ) : (
                    <p className="text-xs text-gray-400">Loading price range…</p>
                )}
            </div>

            {(activeCategory || minPrice || maxPrice) && (
                <button
                    type="button"
                    onClick={onClear}
                    className="w-full py-2.5 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Clear All Filters
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
                <div className="sticky top-28 pr-6 border-r border-gray-100 min-h-[400px]">
                    {sidebarContent}
                </div>
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                        onClick={onMobileClose}
                        aria-hidden
                    />
                    <aside className="fixed top-0 left-0 h-full w-[min(100%,300px)] bg-white z-50 shadow-2xl overflow-y-auto lg:hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <span className="font-bold text-gray-900">Filters</span>
                            <button type="button" onClick={onMobileClose} className="p-2">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">{sidebarContent}</div>
                    </aside>
                </>
            )}
        </>
    );
}
