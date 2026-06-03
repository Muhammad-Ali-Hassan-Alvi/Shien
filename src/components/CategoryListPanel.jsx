"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X, ChevronLeft } from "lucide-react";
import { productsLink } from "@/app/lib/navLinks";
import {
    buildHamburgerSidebarItems,
    getHamburgerPanelContent,
} from "@/app/lib/categoryUtils";

const submenuLinkClass =
    "inline-block text-sm border-b-2 border-transparent pb-0.5 transition-colors hover:text-indigo-600 hover:border-indigo-600";

export default function CategoryListPanel({ isOpen, onClose, lines = [], allCategories = [] }) {
    const lineOptions = useMemo(() => {
        if (lines.length > 0) return lines;
        return allCategories.filter((c) => !c.parent);
    }, [lines, allCategories]);

    const [activeLineId, setActiveLineId] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [mobileSubView, setMobileSubView] = useState(false);

    const activeLine = useMemo(
        () => lineOptions.find((l) => l._id === activeLineId) || lineOptions[0] || null,
        [lineOptions, activeLineId]
    );

    const sidebarItems = useMemo(
        () => (activeLine ? buildHamburgerSidebarItems(activeLine.name) : []),
        [activeLine]
    );

    const activePanelItem = sidebarItems.find((m) => m.id === activeMenuId && m.type === "panel") || null;

    const panelContent = useMemo(() => {
        if (!activeMenuId || !activeLine) return null;
        return getHamburgerPanelContent(activeMenuId, activeLine);
    }, [activeMenuId, activeLine]);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        setActiveMenuId(null);
        setMobileSubView(false);
    }, [isOpen]);

    useEffect(() => {
        if (lineOptions.length && !activeLineId) {
            setActiveLineId(lineOptions[0]._id);
        }
    }, [lineOptions, activeLineId]);

    const handleLineSelect = (lineId) => {
        setActiveLineId(lineId);
        setActiveMenuId(null);
        setMobileSubView(false);
    };

    const handlePanelSelect = (menuId) => {
        setActiveMenuId(menuId);
        setMobileSubView(true);
    };

    const handleBackToMenus = () => {
        setMobileSubView(false);
        setActiveMenuId(null);
    };

    if (!isOpen) return null;

    const showSubPanel = !!activePanelItem;
    const showSubOnMobile = mobileSubView && showSubPanel;

    const sidebarBtnClass = (isActive, highlight) =>
        `w-full text-left px-5 sm:px-8 py-3 text-sm font-medium uppercase tracking-wide transition-colors border-l-2 ${
            isActive
                ? "text-black border-black bg-gray-50"
                : highlight
                  ? "text-red-600 border-transparent hover:bg-red-50"
                  : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-black"
        }`;

    return (
        <>
            <button
                type="button"
                className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-[2px]"
                aria-label="Close category menu"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 left-0 z-[70] w-full max-w-4xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-100 shrink-0">
                    <Link
                        href="/"
                        onClick={onClose}
                        className="text-2xl font-playfair font-black tracking-tight text-gray-900"
                    >
                        iMART
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={22} />
                    </button>
                </div>

                {lineOptions.length > 0 && (
                    <div className="px-5 sm:px-8 py-4 border-b border-gray-100 flex flex-wrap gap-x-4 gap-y-2 sm:gap-6 shrink-0">
                        {lineOptions.map((line) => (
                            <button
                                key={line._id}
                                type="button"
                                onClick={() => handleLineSelect(line._id)}
                                className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] pb-1 border-b-2 transition-colors whitespace-nowrap ${
                                    activeLine?._id === line._id
                                        ? "text-black border-black"
                                        : "text-gray-400 border-transparent hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {line.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
                    <aside
                        className={`sm:w-56 lg:w-64 border-b sm:border-b-0 sm:border-r border-gray-100 shrink-0 overflow-y-auto ${
                            showSubOnMobile ? "hidden sm:block" : "block"
                        }`}
                    >
                        <nav className="py-2 sm:py-4">
                            <Link
                                href={productsLink({ sort: "new" })}
                                onClick={onClose}
                                className="block px-5 sm:px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                New In
                            </Link>

                            {sidebarItems.map((item) => {
                                if (item.type === "link") {
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={onClose}
                                            className={`block px-5 sm:px-8 py-3 text-sm font-medium uppercase tracking-wide transition-colors hover:bg-gray-50 ${
                                                item.highlight
                                                    ? "text-red-600 hover:bg-red-50"
                                                    : "text-gray-600 hover:text-black"
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                }

                                const isActive = activeMenuId === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handlePanelSelect(item.id)}
                                        className={sidebarBtnClass(isActive, false)}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}

                            {activeLine && (
                                <Link
                                    href={productsLink({ category: activeLine.name })}
                                    onClick={onClose}
                                    className="block px-5 sm:px-8 py-3 text-sm font-bold uppercase tracking-wide text-gray-900 hover:bg-gray-50 mt-2 border-t border-gray-100"
                                >
                                    View All
                                </Link>
                            )}

                            {!activeLine && lineOptions.length === 0 && (
                                <p className="px-5 py-4 text-sm text-gray-400">No categories yet.</p>
                            )}
                        </nav>
                    </aside>

                    <div
                        className={`flex-1 overflow-y-auto min-h-0 flex flex-col ${
                            showSubPanel ? "flex" : "hidden sm:flex"
                        } ${!showSubPanel ? "sm:items-center sm:justify-center sm:p-8" : ""}`}
                    >
                        {showSubOnMobile && (
                            <button
                                type="button"
                                onClick={handleBackToMenus}
                                className="sm:hidden flex items-center gap-2 px-5 py-4 text-sm font-bold uppercase tracking-wide text-gray-900 border-b border-gray-100 hover:bg-gray-50 shrink-0"
                            >
                                <ChevronLeft size={18} />
                                Back
                            </button>
                        )}

                        {showSubPanel && panelContent ? (
                            <div className="p-5 sm:p-8 flex-1">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                                    {panelContent.title}
                                </p>
                                <Link
                                    href={productsLink({ category: activeLine.name })}
                                    onClick={onClose}
                                    className={`${submenuLinkClass} text-xs font-bold uppercase tracking-widest text-gray-900 border-black mb-8`}
                                >
                                    View All {activeLine.name}
                                </Link>

                                {panelContent.groups.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                                        {panelContent.groups.map((group) => (
                                            <div key={group.title}>
                                                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 mb-4 pb-2 border-b-2 border-gray-200 inline-block">
                                                    {group.title}
                                                </h3>
                                                <ul className="space-y-3 mt-4">
                                                    {group.items.map((item) => (
                                                        <li key={item._id || item.name}>
                                                            <Link
                                                                href={
                                                                    item.href ||
                                                                    productsLink({ category: item.name })
                                                                }
                                                                onClick={onClose}
                                                                className={`${submenuLinkClass} ${
                                                                    item.highlight
                                                                        ? "text-red-600 font-semibold"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No items in this section yet.</p>
                                )}
                            </div>
                        ) : activeLine ? (
                            <p className="hidden sm:block text-sm text-gray-400 text-center max-w-sm px-4 leading-relaxed">
                                Choose <strong>Shop by Category</strong>, <strong>Shop by Discount</strong>, or a
                                price filter on the left.
                            </p>
                        ) : (
                            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 sm:p-8 w-full">
                                {allCategories
                                    .filter((c) => !c.parent)
                                    .map((cat) => (
                                        <Link
                                            key={cat._id}
                                            href={productsLink({ category: cat.name })}
                                            onClick={onClose}
                                            className={`${submenuLinkClass} text-gray-700 py-2`}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-5 sm:px-8 py-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500 shrink-0">
                    <Link href="/products" onClick={onClose} className="hover:text-black">
                        All Products
                    </Link>
                    <Link href="/profile" onClick={onClose} className="hover:text-black">
                        My Account
                    </Link>
                    <Link href="/wishlist" onClick={onClose} className="hover:text-black">
                        Wishlist
                    </Link>
                </div>
            </div>
        </>
    );
}
