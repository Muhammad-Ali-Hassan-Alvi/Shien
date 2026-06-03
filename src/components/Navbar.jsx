"use client";

import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Search, User, Heart, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import NotificationDropdown from "./NotificationDropdown";
import CategoryListPanel from "./CategoryListPanel";
import { useRouter } from "next/navigation";
import { productsLink } from "@/app/lib/navLinks";
import { getLineCategories, getNavCategories, buildMegaMenuColumns } from "@/app/lib/categoryUtils";

const STATIC_NAV = [
    { label: "New In", href: productsLink({ sort: "new" }), static: true },
];

const SALE_NAV = { label: "Sale", href: productsLink({ sort: "price_asc" }), highlight: true, static: true };

const MAX_PRIMARY_NAV = 3;

function categoryToNavItem(category) {
    const megaColumns = buildMegaMenuColumns(category);
    return {
        label: category.name,
        href: productsLink({ category: category.name }),
        mega: !!megaColumns,
        subCategories: megaColumns || [],
        _id: category._id,
    };
}

function MegaMenuPanel({ subCategories, open, onEnter, onLeave }) {
    if (!open || !subCategories?.length) return null;
    const cols = Math.min(subCategories.length, 4);

    return (
        <div
            className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+2px)] z-[100] w-[min(92vw,560px)] transition-all duration-150 ${
                open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            }`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            <div
                className="bg-white border border-gray-200 shadow-xl rounded-xl p-5 grid gap-5"
                style={{ gridTemplateColumns: `repeat(${Math.min(cols, subCategories.length)}, minmax(0, 1fr))` }}
            >
                {subCategories.map((sub) => (
                    <div key={sub.title} className="space-y-2 min-w-0">
                        <Link
                            href={productsLink({ category: sub.title })}
                            className="font-playfair font-bold text-sm text-gray-900 border-b border-gray-100 pb-1.5 block hover:text-indigo-600 transition-colors"
                        >
                            {sub.title}
                        </Link>
                        {sub.items.length > 0 && (
                            <ul className="space-y-1">
                                {sub.items.map((subItem) => (
                                    <li key={subItem.name}>
                                        <Link
                                            href={productsLink({ category: subItem.name })}
                                            className="text-gray-500 hover:text-indigo-600 block text-sm transition-colors"
                                        >
                                            {subItem.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function NavMenuItem({ item }) {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef(null);

    const keepOpen = useCallback(() => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        if (item.mega) setOpen(true);
    }, [item.mega]);

    const scheduleClose = useCallback(() => {
        closeTimer.current = setTimeout(() => setOpen(false), 200);
    }, []);

    useEffect(() => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }, []);

    return (
        <div className="relative" onMouseEnter={keepOpen} onMouseLeave={scheduleClose}>
            <Link
                href={item.href}
                className={`py-2 flex items-center gap-1 text-sm whitespace-nowrap transition-colors ${
                    item.highlight ? "text-red-500 font-bold" : "text-gray-700 hover:text-indigo-600"
                } ${open && !item.highlight ? "text-indigo-600" : ""}`}
            >
                <span className="max-w-[140px] truncate" title={item.label}>
                    {item.label}
                </span>
                {item.mega && (
                    <ChevronDown size={14} className={`shrink-0 opacity-60 ${open ? "rotate-180" : ""}`} />
                )}
            </Link>
            {item.mega && (
                <MegaMenuPanel
                    subCategories={item.subCategories}
                    open={open}
                    onEnter={keepOpen}
                    onLeave={scheduleClose}
                />
            )}
        </div>
    );
}

function MoreCategoriesMenu({ items }) {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef(null);

    const keepOpen = useCallback(() => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen(true);
    }, []);

    const scheduleClose = useCallback(() => {
        closeTimer.current = setTimeout(() => setOpen(false), 200);
    }, []);

    if (!items.length) return null;

    return (
        <div className="relative" onMouseEnter={keepOpen} onMouseLeave={scheduleClose}>
            <button
                type="button"
                className={`py-2 flex items-center gap-1 text-sm font-medium whitespace-nowrap transition-colors ${
                    open ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
                }`}
            >
                More
                <ChevronDown size={14} className={`shrink-0 opacity-60 ${open ? "rotate-180" : ""}`} />
            </button>
            <div
                className={`absolute right-0 top-[calc(100%+2px)] z-[100] w-56 transition-all duration-150 ${
                    open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
                onMouseEnter={keepOpen}
                onMouseLeave={scheduleClose}
            >
                <ul className="bg-white border border-gray-200 shadow-xl rounded-xl py-2 overflow-hidden">
                    {items.map((item) => (
                        <li key={item._id || item.label}>
                            <Link
                                href={item.href}
                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function Navbar() {
    const router = useRouter();
    const { openCart } = useUIStore();
    const { items } = useCartStore();
    const [scrolled, setScrolled] = useState(false);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [navCategories, setNavCategories] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        async function fetchNavCategories() {
            try {
                const res = await fetch("/api/categories?tree=true&nav=true");
                const data = await res.json();
                if (data.categories) setNavCategories(data.categories);
            } catch (e) {
                console.error("Failed to load nav categories", e);
            }
        }
        fetchNavCategories();
    }, []);

    const navLines = useMemo(() => getLineCategories(navCategories), [navCategories]);

    const dynamicNav = useMemo(
        () => getNavCategories(navCategories).map(categoryToNavItem),
        [navCategories]
    );

    const primaryNav = useMemo(() => {
        const primary = dynamicNav.slice(0, MAX_PRIMARY_NAV);
        const overflow = dynamicNav.slice(MAX_PRIMARY_NAV);
        return { primary, overflow };
    }, [dynamicNav]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (categoryMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [categoryMenuOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(productsLink({ search: query.trim() }));
            setShowSearch(false);
            setCategoryMenuOpen(false);
            setQuery("");
        }
    };

    return (
        <>
            <nav className={`sticky top-0 z-50 transition-all duration-500 overflow-visible ${scrolled ? "py-2" : "py-4"}`}>
                <div
                    className={`mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 xl:px-8 transition-all duration-500 rounded-none md:rounded-2xl xl:rounded-full border border-white/40 shadow-sm hover:shadow-lg overflow-visible ${
                        scrolled ? "bg-white/90 backdrop-blur-xl xl:w-[95%]" : "bg-white/50 backdrop-blur-lg xl:w-[98%]"
                    }`}
                >
                    <div className="flex items-center gap-2 sm:gap-3 min-h-[52px] py-1 min-w-0">
                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={() => setCategoryMenuOpen(true)}
                                className="p-2 hover:bg-white/60 rounded-full transition-colors shrink-0"
                                aria-label="Open all categories"
                            >
                                <Menu size={22} className="text-gray-800" />
                            </button>
                            <Link
                                href="/"
                                className="px-1.5 sm:px-3 py-2 text-lg sm:text-2xl font-playfair font-black tracking-tighter text-gray-900 hover:opacity-80 transition-opacity whitespace-nowrap"
                            >
                                iMART
                            </Link>
                        </div>

                        {/* Tablet / small laptop: no cramped link row — use category drawer */}
                        {!showSearch && (
                            <div className="hidden md:flex xl:hidden flex-1 justify-center min-w-0 px-2">
                                <button
                                    type="button"
                                    onClick={() => setCategoryMenuOpen(true)}
                                    className="max-w-full truncate px-4 py-2 text-sm font-semibold text-gray-800 border border-gray-200 rounded-full hover:bg-white/80 transition-colors"
                                >
                                    Browse Categories
                                </button>
                            </div>
                        )}

                        {/* Large screens only: full nav + hover submenus */}
                        {!showSearch && (
                            <div className="hidden xl:flex flex-1 items-center justify-center gap-5 2xl:gap-7 min-w-0 px-2">
                                <Link
                                    href={productsLink()}
                                    className="py-2 text-sm text-gray-700 hover:text-indigo-600 whitespace-nowrap shrink-0"
                                >
                                    All Products
                                </Link>
                                <NavMenuItem item={STATIC_NAV[0]} />
                                {primaryNav.primary.map((item) => (
                                    <NavMenuItem key={item._id || item.label} item={item} />
                                ))}
                                <MoreCategoriesMenu items={primaryNav.overflow} />
                                <NavMenuItem item={SALE_NAV} />
                            </div>
                        )}

                        {showSearch && (
                            <div className="hidden md:flex flex-1 min-w-0 px-2 max-w-xl mx-auto">
                                <form onSubmit={handleSearch} className="w-full relative">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search for products..."
                                        className="w-full bg-white/80 border border-gray-200 rounded-full py-2.5 pl-5 pr-12 outline-none focus:ring-2 focus:ring-black/10 shadow-inner text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSearch(false)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                                    >
                                        <X size={16} />
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* md–lg: compact actions (avoids overlap with nav) */}
                        <div className="hidden md:flex xl:hidden items-center gap-0.5 shrink-0 ml-auto">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`p-2 hover:bg-white/60 rounded-full transition-all ${showSearch ? "bg-black text-white" : ""}`}
                                aria-label="Search"
                            >
                                <Search
                                    className={`w-5 h-5 ${showSearch ? "text-white" : "text-gray-700"}`}
                                    strokeWidth={2}
                                />
                            </button>
                            <button
                                onClick={openCart}
                                className="p-2 hover:bg-white/60 rounded-full transition-all relative"
                            >
                                <ShoppingBag className="w-5 h-5 text-gray-700" strokeWidth={2} />
                                {items.length > 0 && (
                                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                                        {items.length}
                                    </span>
                                )}
                            </button>
                            <Link href="/profile" className="p-2 hover:bg-white/60 rounded-full transition-all">
                                <User className="w-5 h-5 text-gray-700" strokeWidth={2} />
                            </Link>
                        </div>

                        {/* xl+: full action bar */}
                        <div className="hidden xl:flex items-center gap-0.5 shrink-0 ml-auto">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`p-2.5 hover:bg-white/60 rounded-full transition-all ${showSearch ? "bg-black text-white" : ""}`}
                                aria-label="Search"
                            >
                                <Search
                                    className={`w-5 h-5 ${showSearch ? "text-white" : "text-gray-700"}`}
                                    strokeWidth={2}
                                />
                            </button>
                            <NotificationDropdown />
                            <Link href="/wishlist" className="p-2.5 hover:bg-white/60 rounded-full transition-all">
                                <Heart className="w-5 h-5 text-gray-700" strokeWidth={2} />
                            </Link>
                            <button
                                onClick={openCart}
                                className="p-2.5 hover:bg-white/60 rounded-full transition-all relative"
                            >
                                <ShoppingBag className="w-5 h-5 text-gray-700" strokeWidth={2} />
                                {items.length > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                                        {items.length}
                                    </span>
                                )}
                            </button>
                            <Link href="/profile" className="p-2.5 hover:bg-white/60 rounded-full transition-all">
                                <User className="w-5 h-5 text-gray-700" strokeWidth={2} />
                            </Link>
                        </div>

                        <div className="flex md:hidden items-center gap-0.5 shrink-0 ml-auto">
                            <button
                                type="button"
                                onClick={() => setShowSearch((v) => !v)}
                                className="p-2"
                                aria-label="Search"
                            >
                                <Search size={22} className="text-gray-800" />
                            </button>
                            <NotificationDropdown />
                            <button onClick={openCart} className="p-2 relative">
                                <ShoppingBag className="w-6 h-6 text-gray-800" />
                                {items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center border border-white">
                                        {items.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {showSearch && (
                        <form onSubmit={handleSearch} className="md:hidden px-2 pb-3 relative">
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full bg-white/80 border border-gray-200 rounded-full py-2.5 pl-4 pr-10 outline-none text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowSearch(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                            >
                                <X size={16} />
                            </button>
                        </form>
                    )}
                </div>
            </nav>

            <CategoryListPanel
                isOpen={categoryMenuOpen}
                onClose={() => setCategoryMenuOpen(false)}
                lines={navLines}
                allCategories={navCategories}
            />
        </>
    );
}
