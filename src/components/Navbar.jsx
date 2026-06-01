"use client";

import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Search, User, Heart, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState, useMemo, Suspense } from "react";
import NotificationDropdown from "./NotificationDropdown";
import LinesNav from "./LinesNav";
import CategoryListPanel from "./CategoryListPanel";
import { useRouter } from "next/navigation";
import { productsLink } from "@/app/lib/navLinks";
import { getLineCategories, getNavCategories } from "@/app/lib/categoryUtils";

const STATIC_NAV = [
    { label: "Products", href: productsLink(), static: true },
    { label: "New In", href: productsLink({ sort: "new" }), static: true },
];

const SALE_NAV = { label: "Sale", href: productsLink({ sort: "price_asc" }), highlight: true, static: true };

function buildMegaColumns(category) {
    const children = category.children || [];
    if (children.length === 0) return null;

    return children.map((child) => ({
        title: child.name,
        items:
            child.children?.length > 0
                ? child.children.map((c) => ({ name: c.name }))
                : [{ name: child.name }],
    }));
}

function categoryToNavItem(category) {
    const megaColumns = buildMegaColumns(category);
    return {
        label: category.name,
        href: productsLink({ category: category.name }),
        mega: !!megaColumns,
        subCategories: megaColumns || [],
        _id: category._id,
    };
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

    const navMenu = useMemo(() => {
        const dynamic = getNavCategories(navCategories).map(categoryToNavItem);
        return [...STATIC_NAV, ...dynamic, SALE_NAV];
    }, [navCategories]);

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

    const renderMegaMenu = (item) => {
        if (!item.mega || !item.subCategories?.length) return null;
        const cols = Math.min(item.subCategories.length, 4);

        return (
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[min(90vw,640px)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                <div
                    className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl p-6 grid gap-8 relative overflow-hidden"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none -z-10" />
                    {item.subCategories.map((sub) => (
                        <div key={sub.title} className="space-y-3">
                            <h4 className="font-playfair font-bold text-base text-gray-900 border-b border-gray-100 pb-2">
                                {sub.title}
                            </h4>
                            <ul className="space-y-1.5">
                                {sub.items.map((subItem) => (
                                    <li key={subItem.name}>
                                        <Link
                                            href={productsLink({ category: subItem.name })}
                                            className="text-gray-500 hover:text-indigo-600 block text-sm transition-colors hover:translate-x-1 duration-200"
                                        >
                                            {subItem.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
                <div
                    className={`mx-auto max-w-7xl px-4 md:px-8 transition-all duration-500 rounded-none md:rounded-full border border-white/40 shadow-sm hover:shadow-lg ${scrolled ? "bg-white/70 backdrop-blur-xl w-full md:w-[95%]" : "bg-white/30 backdrop-blur-lg w-full md:w-[98%]"} flex flex-col relative overflow-visible`}
                >
                    <div className="flex items-center justify-between min-h-[52px] gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                            <button
                                type="button"
                                onClick={() => setCategoryMenuOpen(true)}
                                className="p-2 hover:bg-white/50 rounded-full transition-colors shrink-0"
                                aria-label="Open category menu"
                            >
                                <Menu size={22} className="text-gray-800" />
                            </button>
                            <Link
                                href="/"
                                className="px-2 sm:px-4 py-2 text-xl sm:text-2xl font-playfair font-black tracking-tighter bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity truncate"
                            >
                                iMART
                            </Link>
                        </div>

                        <div
                            className={`hidden md:flex items-center gap-6 lg:gap-8 font-medium text-sm text-gray-700 ${showSearch ? "opacity-0 pointer-events-none absolute" : "opacity-100 relative"}`}
                        >
                            {navMenu.map((item) => (
                                <div key={item._id || item.label} className="relative group">
                                    <Link
                                        href={item.href}
                                        className={`relative py-3 flex items-center gap-1 transition-colors whitespace-nowrap ${item.highlight ? "text-red-500 font-bold" : "hover:text-indigo-600"}`}
                                    >
                                        {item.label}
                                        {item.mega && (
                                            <ChevronDown
                                                size={14}
                                                className="group-hover:rotate-180 transition-transform duration-300"
                                            />
                                        )}
                                        {!item.highlight && (
                                            <span className="absolute inset-x-0 bottom-1 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-center ease-out duration-300" />
                                        )}
                                    </Link>
                                    {renderMegaMenu(item)}
                                </div>
                            ))}
                        </div>

                        {showSearch && (
                            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-1/2">
                                <form onSubmit={handleSearch} className="w-full relative">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search for products..."
                                        className="w-full bg-white/50 backdrop-blur-md border border-gray-200 rounded-full py-2.5 pl-5 pr-12 outline-none focus:ring-2 focus:ring-black shadow-inner"
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

                        <div className="hidden md:flex items-center gap-2 pr-2 shrink-0">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group ${showSearch ? "bg-black text-white hover:bg-gray-800" : ""}`}
                                aria-label="Search"
                            >
                                <Search
                                    className={`w-5 h-5 group-hover:text-indigo-600 ${showSearch ? "text-white group-hover:text-white" : "text-gray-700"}`}
                                    strokeWidth={2}
                                />
                            </button>
                            <NotificationDropdown />
                            <Link href="/wishlist" className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group">
                                <Heart className="w-5 h-5 text-gray-700 group-hover:text-pink-600" strokeWidth={2} />
                            </Link>
                            <button
                                onClick={openCart}
                                className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group relative"
                            >
                                <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-indigo-600" strokeWidth={2} />
                                {items.length > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border border-white animate-pulse">
                                        {items.length}
                                    </span>
                                )}
                            </button>
                            <Link href="/profile" className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group">
                                <User className="w-5 h-5 text-gray-700 group-hover:text-indigo-600" strokeWidth={2} />
                            </Link>
                        </div>

                        <div className="flex md:hidden items-center gap-1 shrink-0">
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

                    {navLines.length > 0 && (
                        <Suspense fallback={null}>
                            <LinesNav lines={navLines} />
                        </Suspense>
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
