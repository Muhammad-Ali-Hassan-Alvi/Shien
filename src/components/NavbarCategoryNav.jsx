"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { productsLink } from "@/app/lib/navLinks";
import {
    splitNavCategories,
    flattenCategoryTree,
    findCategoryPathInTree,
} from "@/app/lib/categoryUtils";

const NAV_FONT =
    "font-[family-name:var(--font-montserrat)] font-normal text-[#212529]";

const tabClass = (active) =>
    `shrink-0 text-xs sm:text-sm md:text-[15px] uppercase tracking-[0.08em] sm:tracking-[0.1em] md:tracking-[0.12em] leading-6 pb-1 border-b-2 transition-colors whitespace-nowrap ${
        active
            ? "text-[#212529] border-[#212529] font-medium"
            : "text-gray-700 border-transparent hover:text-[#212529] hover:border-gray-400"
    }`;

function categoryIsActive(node, categoryParam) {
    if (!categoryParam) return false;
    if (node.name.toLowerCase() === categoryParam) return true;
    const walk = (n) => {
        if (n.name.toLowerCase() === categoryParam) return true;
        return (n.children || []).some(walk);
    };
    return walk(node);
}

export default function NavbarCategoryNav({ categoryTree }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category")?.toLowerCase() || "";
    const sortParam = searchParams.get("sort")?.toLowerCase() || "";
    const [moreOpen, setMoreOpen] = useState(false);
    const [moreSearch, setMoreSearch] = useState("");
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 340 });

    const moreButtonRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    const { primary, overflow } = useMemo(
        () => splitNavCategories(categoryTree),
        [categoryTree]
    );

    const flatCategories = useMemo(
        () => flattenCategoryTree(categoryTree || []),
        [categoryTree]
    );

    const saleActive = sortParam === "sale";
    const moreActive = overflow.some((cat) => categoryIsActive(cat, categoryParam));
    const trimmedSearch = moreSearch.trim();
    const isFiltering = trimmedSearch.length > 0;

    const dropdownCategories = useMemo(() => {
        if (!isFiltering) return overflow;

        const q = trimmedSearch.toLowerCase();
        return flatCategories
            .filter((cat) => cat.name.toLowerCase().includes(q))
            .slice(0, 12);
    }, [isFiltering, trimmedSearch, overflow, flatCategories]);

    const updateDropdownPosition = useCallback(() => {
        if (!moreButtonRef.current) return;
        const rect = moreButtonRef.current.getBoundingClientRect();
        const width = Math.min(340, window.innerWidth * 0.92);
        let left = rect.left + rect.width / 2 - width / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
        setDropdownPos({
            top: rect.bottom + 8,
            left,
            width,
        });
    }, []);

    useEffect(() => {
        if (!moreOpen) return;
        updateDropdownPosition();
        window.addEventListener("scroll", updateDropdownPosition, true);
        window.addEventListener("resize", updateDropdownPosition);
        return () => {
            window.removeEventListener("scroll", updateDropdownPosition, true);
            window.removeEventListener("resize", updateDropdownPosition);
        };
    }, [moreOpen, updateDropdownPosition]);

    useEffect(() => {
        const onPointerDown = (e) => {
            const inButton = moreButtonRef.current?.contains(e.target);
            const inDropdown = dropdownRef.current?.contains(e.target);
            if (!inButton && !inDropdown) {
                setMoreOpen(false);
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    useEffect(() => {
        if (!moreOpen) {
            setMoreSearch("");
            return;
        }
        const timer = setTimeout(() => {
            updateDropdownPosition();
            searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, [moreOpen, updateDropdownPosition]);

    const closeMore = () => {
        setMoreOpen(false);
        setMoreSearch("");
    };

    const submitProductSearch = (e) => {
        e.preventDefault();
        if (!trimmedSearch) return;
        closeMore();
        router.push(productsLink({ search: trimmedSearch }));
    };

    const moreDropdownPanel =
        moreOpen &&
        typeof document !== "undefined" &&
        createPortal(
            <div
                ref={dropdownRef}
                className="fixed z-[200] flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.28)]"
                style={{
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                }}
                role="menu"
            >
                <form
                    onSubmit={submitProductSearch}
                    className="shrink-0 p-3 border-b border-gray-100 bg-white"
                >
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            aria-hidden
                        />
                        <input
                            ref={searchInputRef}
                            type="search"
                            value={moreSearch}
                            onChange={(e) => setMoreSearch(e.target.value)}
                            placeholder="Search categories or products..."
                            className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-[#212529] focus:ring-1 focus:ring-[#212529]/10 ${NAV_FONT}`}
                            aria-label="Search in More menu"
                        />
                    </div>
                </form>

                <div className="py-1 max-h-[min(60vh,360px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {isFiltering && (
                        <button
                            type="button"
                            onClick={() => {
                                closeMore();
                                router.push(productsLink({ search: trimmedSearch }));
                            }}
                            className="block w-full text-left px-4 py-2.5 text-sm font-medium text-[#212529] hover:bg-gray-50 border-b border-gray-50"
                        >
                            Search all products for &ldquo;{trimmedSearch}&rdquo;
                        </button>
                    )}

                    {dropdownCategories.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-500 text-center">
                            {isFiltering
                                ? `No categories match “${trimmedSearch}”`
                                : "No extra categories"}
                        </p>
                    ) : (
                        <>
                            {!isFiltering && (
                                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                    More categories
                                </p>
                            )}
                            {isFiltering && (
                                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                    Categories
                                </p>
                            )}
                            {dropdownCategories.map((cat) => {
                                const breadcrumb = findCategoryPathInTree(
                                    categoryTree,
                                    cat.name
                                );
                                return (
                                    <Link
                                        key={cat._id}
                                        href={productsLink({ category: cat.name })}
                                        onClick={closeMore}
                                        className={`block px-4 py-2.5 transition-colors hover:bg-gray-50 ${
                                            categoryIsActive(cat, categoryParam)
                                                ? "bg-gray-50"
                                                : ""
                                        }`}
                                        role="menuitem"
                                    >
                                        <span
                                            className={`block text-sm uppercase tracking-[0.06em] ${
                                                categoryIsActive(cat, categoryParam)
                                                    ? "text-[#212529] font-semibold"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {cat.name}
                                        </span>
                                        {isFiltering &&
                                            breadcrumb &&
                                            breadcrumb.length > 1 && (
                                                <span className="block text-xs text-gray-400 normal-case tracking-normal mt-0.5">
                                                    {breadcrumb.join(" › ")}
                                                </span>
                                            )}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>,
            document.body
        );

    return (
        <div className="w-full border-t border-white/50 px-2 sm:px-4 md:px-6">
            <div
                className={`flex flex-nowrap items-center justify-center gap-x-3 sm:gap-x-5 md:gap-x-8 lg:gap-x-10 py-2 sm:py-2.5 w-full ${NAV_FONT}`}
            >
                {primary.map((line) => (
                    <Link
                        key={line._id}
                        href={productsLink({ category: line.name })}
                        className={tabClass(categoryIsActive(line, categoryParam))}
                        title={line.name}
                    >
                        {line.name}
                    </Link>
                ))}

                <Link
                    href={productsLink({ sort: "sale" })}
                    className={`${tabClass(saleActive)} shrink-0 font-bold ${
                        saleActive
                            ? "text-red-600 border-red-600"
                            : "text-red-600 hover:border-red-300"
                    }`}
                >
                    Sale
                </Link>

                {overflow.length > 0 && (
                    <div ref={moreButtonRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setMoreOpen((v) => !v)}
                            className={`inline-flex items-center gap-0.5 sm:gap-1 ${tabClass(moreActive || moreOpen)}`}
                            aria-expanded={moreOpen}
                            aria-haspopup="true"
                        >
                            More
                            <ChevronDown
                                size={14}
                                className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                    </div>
                )}

                {moreDropdownPanel}
            </div>
        </div>
    );
}
