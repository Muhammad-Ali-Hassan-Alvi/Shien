"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2, ArrowRight, Tag } from "lucide-react";
import { productsLink } from "@/app/lib/navLinks";
import { flattenCategoryTree } from "@/app/lib/categoryUtils";

const NAV_FONT =
    "font-[family-name:var(--font-montserrat)] font-normal text-[#212529]";

const DEBOUNCE_MS = 320;
const MIN_QUERY_LENGTH = 2;

function highlightMatch(text, query) {
    if (!query?.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-amber-100 text-inherit rounded px-0.5">
                {text.slice(idx, idx + query.trim().length)}
            </mark>
            {text.slice(idx + query.trim().length)}
        </>
    );
}

export default function NavbarSearch({
    categoryTree = [],
    onCloseMenu,
    className = "",
    query: controlledQuery,
    setQuery: setControlledQuery,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const containerRef = useRef(null);
    const abortRef = useRef(null);

    const [internalQuery, setInternalQuery] = useState("");
    const query = controlledQuery ?? internalQuery;
    const setQuery = setControlledQuery ?? setInternalQuery;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fromUrl = searchParams.get("search");
        if (fromUrl) setQuery(fromUrl);
    }, [searchParams, setQuery]);

    const flatCategories = useMemo(
        () => flattenCategoryTree(categoryTree || []),
        [categoryTree]
    );

    const categoryMatches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q.length < MIN_QUERY_LENGTH) return [];
        return flatCategories
            .filter((c) => c.name.toLowerCase().includes(q))
            .slice(0, 4);
    }, [flatCategories, query]);

    const fetchSuggestions = useCallback(async (term) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await fetch(
                `/api/products?search=${encodeURIComponent(term)}&limit=6`,
                { signal: controller.signal }
            );
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            setProducts(data.products || []);
            setTotal(data.total ?? data.products?.length ?? 0);
        } catch (err) {
            if (err.name !== "AbortError") {
                setProducts([]);
                setTotal(0);
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const term = query.trim();
        if (term.length < MIN_QUERY_LENGTH) {
            setProducts([]);
            setTotal(0);
            setLoading(false);
            return;
        }

        setOpen(true);
        const timer = setTimeout(() => fetchSuggestions(term), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [query, fetchSuggestions]);

    useEffect(() => {
        const onPointerDown = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    const navigateToSearch = (term) => {
        const q = term.trim();
        if (!q) return;
        setOpen(false);
        onCloseMenu?.();
        router.push(productsLink({ search: q }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigateToSearch(query);
    };

    const clearQuery = () => {
        setQuery("");
        setProducts([]);
        setTotal(0);
        setOpen(false);
    };

    const trimmed = query.trim();
    const hasResults = categoryMatches.length > 0 || products.length > 0;
    const showDropdown = open && trimmed.length >= MIN_QUERY_LENGTH;

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <form onSubmit={handleSubmit} className="relative w-full" role="search">
                <Search
                    size={18}
                    strokeWidth={1.5}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                    aria-hidden
                />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => trimmed.length >= MIN_QUERY_LENGTH && setOpen(true)}
                    placeholder="Search products..."
                    autoComplete="off"
                    className={`w-full py-3 md:py-3.5 pl-11 pr-10 bg-white/85 border border-gray-200/90 rounded-full text-sm md:text-base leading-6 outline-none focus:border-[#212529] focus:ring-2 focus:ring-[#212529]/10 shadow-sm ${NAV_FONT}`}
                    aria-label="Search products"
                    aria-expanded={showDropdown}
                    aria-controls="navbar-search-dropdown"
                    aria-autocomplete="list"
                />
                {loading && (
                    <Loader2
                        size={16}
                        className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                        aria-hidden
                    />
                )}
                {query && !loading && (
                    <button
                        type="button"
                        onClick={clearQuery}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Clear search"
                    >
                        <X size={16} strokeWidth={1.5} />
                    </button>
                )}
            </form>

            {showDropdown && (
                <div
                    id="navbar-search-dropdown"
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl"
                >
                    {loading && !hasResults ? (
                        <div className="px-5 py-8 text-center text-sm text-gray-500">
                            <Loader2 size={20} className="mx-auto mb-2 animate-spin text-gray-400" />
                            Searching…
                        </div>
                    ) : !hasResults ? (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-gray-600">No results for &ldquo;{trimmed}&rdquo;</p>
                            <button
                                type="button"
                                onClick={() => navigateToSearch(trimmed)}
                                className="mt-3 text-sm font-medium text-[#212529] underline underline-offset-2 hover:opacity-70"
                            >
                                Search all products anyway
                            </button>
                        </div>
                    ) : (
                        <>
                            {categoryMatches.length > 0 && (
                                <div className="border-b border-gray-100 px-2 py-2">
                                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                        Categories
                                    </p>
                                    <ul>
                                        {categoryMatches.map((cat) => (
                                            <li key={cat._id}>
                                                <Link
                                                    href={productsLink({ category: cat.name })}
                                                    onClick={() => {
                                                        setOpen(false);
                                                        onCloseMenu?.();
                                                    }}
                                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                                                    role="option"
                                                >
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                                        <Tag size={14} />
                                                    </span>
                                                    <span className="truncate">
                                                        {highlightMatch(cat.name, trimmed)}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {products.length > 0 && (
                                <div className="px-2 py-2">
                                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                        Products
                                    </p>
                                    <ul>
                                        {products.map((product) => (
                                            <li key={product._id}>
                                                <Link
                                                    href={`/product/${product.slug}`}
                                                    onClick={() => {
                                                        setOpen(false);
                                                        onCloseMenu?.();
                                                        setQuery("");
                                                    }}
                                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                                                    role="option"
                                                >
                                                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        {product.images?.[0] ? (
                                                            <Image
                                                                src={product.images[0]}
                                                                alt=""
                                                                fill
                                                                className="object-cover"
                                                                sizes="40px"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-300">
                                                                —
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-gray-900 group-hover:text-[#212529]">
                                                            {highlightMatch(product.name, trimmed)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {product.category}
                                                            {product.pricing?.salePrice != null && (
                                                                <>
                                                                    {" · Rs. "}
                                                                    {Number(product.pricing.salePrice).toLocaleString()}
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <ArrowRight
                                                        size={14}
                                                        className="shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => navigateToSearch(trimmed)}
                                className={`flex w-full items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-semibold text-[#212529] hover:bg-gray-100 transition-colors ${NAV_FONT}`}
                            >
                                View all results
                                {total > products.length && (
                                    <span className="text-gray-500 font-normal">({total})</span>
                                )}
                                <ArrowRight size={14} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
