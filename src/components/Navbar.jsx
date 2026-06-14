"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import CategoryListPanel from "./CategoryListPanel";
import { productsLink } from "@/app/lib/navLinks";
import { getLineCategories, getNavCategories } from "@/app/lib/categoryUtils";

const NAV_FONT =
    "font-[family-name:var(--font-montserrat)] font-normal text-[#212529]";

function NavbarLinesRow({ lines }) {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category")?.toLowerCase();

    const isLineActive = (line) => {
        if (!categoryParam) return false;
        if (line.name.toLowerCase() === categoryParam) return true;
        const walk = (node) => {
            if (node.name.toLowerCase() === categoryParam) return true;
            return (node.children || []).some(walk);
        };
        return walk(line);
    };

    if (!lines?.length) return null;

    return (
        <div className="w-full border-t border-white/50 px-4 sm:px-6 md:px-8 lg:px-10">
            <div
                className={`flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 md:gap-x-10 lg:gap-x-14 gap-y-2 py-3 w-full ${NAV_FONT}`}
            >
                {lines.map((line) => {
                    const active = isLineActive(line);
                    return (
                        <Link
                            key={line._id}
                            href={productsLink({ category: line.name })}
                            className={`shrink-0 text-sm md:text-[15px] uppercase tracking-[0.12em] leading-6 pb-1 border-b-2 transition-colors whitespace-nowrap ${
                                active
                                    ? "text-[#212529] border-[#212529] font-medium"
                                    : "text-gray-700 border-transparent hover:text-[#212529] hover:border-gray-400"
                            }`}
                            title={line.name}
                        >
                            {line.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function Navbar() {
    const router = useRouter();
    const { openCart } = useUIStore();
    const { items } = useCartStore();
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [categoryTree, setCategoryTree] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories?tree=true");
                const data = await res.json();
                if (data.categories) setCategoryTree(data.categories);
            } catch (e) {
                console.error("Failed to load categories", e);
            }
        }
        fetchCategories();
    }, []);

    const navLines = useMemo(() => {
        const lines = getLineCategories(categoryTree);
        if (lines.length > 0) return lines;
        return getNavCategories(categoryTree).slice(0, 8);
    }, [categoryTree]);

    useEffect(() => {
        if (!categoryMenuOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [categoryMenuOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(productsLink({ search: query.trim() }));
        setShowSearch(false);
        setCategoryMenuOpen(false);
        setQuery("");
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/55 backdrop-blur-xl border-b border-white/40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    {/* Row 1 — hamburger + brand (left) | icons (right) */}
                    <div className="flex items-center justify-between min-h-[60px] md:min-h-[68px] gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <button
                                type="button"
                                onClick={() => setCategoryMenuOpen(true)}
                                className={`inline-flex items-center py-2 hover:opacity-70 transition-opacity shrink-0 ${NAV_FONT}`}
                                aria-label="Open menu"
                            >
                                <Menu size={22} strokeWidth={1.5} aria-hidden />
                            </button>
                            <Link
                                href="/"
                                className={`hover:opacity-70 transition-opacity whitespace-nowrap uppercase tracking-[0.16em] text-lg md:text-[1.65rem] leading-tight truncate ${NAV_FONT}`}
                            >
                                Islamabad Mart
                            </Link>
                        </div>

                        <div className="flex justify-end items-center gap-1 sm:gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowSearch((v) => !v)}
                                className="p-2 hover:opacity-70 transition-opacity text-[#212529]"
                                aria-label="Search"
                            >
                                <Search size={22} strokeWidth={1.5} />
                            </button>
                            <Link
                                href="/profile"
                                className="p-2 hover:opacity-70 transition-opacity text-[#212529]"
                                aria-label="Account"
                            >
                                <User size={22} strokeWidth={1.5} />
                            </Link>
                            <button
                                type="button"
                                onClick={openCart}
                                className="p-2 hover:opacity-70 transition-opacity text-[#212529] relative"
                                aria-label="Shopping bag"
                            >
                                <ShoppingBag size={22} strokeWidth={1.5} />
                                {items.length > 0 && (
                                    <span className="absolute top-1 right-0.5 min-w-[17px] h-[17px] px-0.5 bg-[#212529] text-white text-[10px] font-medium flex items-center justify-center rounded-full">
                                        {items.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {showSearch && (
                        <form onSubmit={handleSearch} className="pb-4 relative">
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products..."
                                className={`w-full border border-gray-200/80 bg-white/70 py-2.5 pl-4 pr-10 outline-none focus:border-[#212529] text-base leading-6 ${NAV_FONT}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowSearch(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#212529] hover:opacity-70"
                                aria-label="Close search"
                            >
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        </form>
                    )}
                </div>

                {/* Row 2 — full-width category tabs */}
                <Suspense fallback={null}>
                    <NavbarLinesRow lines={navLines} />
                </Suspense>
            </header>

            <CategoryListPanel
                isOpen={categoryMenuOpen}
                onClose={() => setCategoryMenuOpen(false)}
                lines={navLines}
                allCategories={categoryTree}
            />
        </>
    );
}
