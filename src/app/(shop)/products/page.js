"use client";



import { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Filter } from "lucide-react";

import { toast } from "react-hot-toast";

import { use } from "react";

import ProductCard from "@/components/ProductCard";

import StyledSelect from "@/components/ui/StyledSelect";

import ProductFilterSidebar from "@/components/ProductFilterSidebar";

import { productsLink } from "@/app/lib/navLinks";

import { findCategoryInTree, findCategoryPathInTree, getSubcategoryNavItems } from "@/app/lib/categoryUtils";

const BREADCRUMB_CLASS =
    "font-[family-name:var(--font-montserrat)] text-base font-normal leading-6 text-[#212529]";



const SORT_OPTIONS = [

    { value: "new", label: "Newest Arrivals" },

    { value: "sale", label: "On Sale" },

    { value: "bestsellers", label: "Best Sellers" },

    { value: "price_asc", label: "Price: Low to High" },

    { value: "price_desc", label: "Price: High to Low" },

];



export default function ShopPage(props) {

    const searchParams = use(props.searchParams);

    const router = useRouter();



    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [categoryTree, setCategoryTree] = useState([]);
    const [priceBounds, setPriceBounds] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const [filters, setFilters] = useState({
        category: searchParams.category || "",
        search: searchParams.search || "",
        sort: searchParams.sort || "new",
        minPrice: searchParams.minPrice || "",
        maxPrice: searchParams.maxPrice || "",
        minDiscount: searchParams.minDiscount || "",
        maxDiscount: searchParams.maxDiscount || "",
    });



    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);



    useEffect(() => {
        async function fetchCats() {
            try {
                const res = await fetch("/api/categories?tree=true");
                if (!res.ok) {
                    console.error("Categories API failed:", res.status);
                    return;
                }
                const data = await res.json();
                if (data.categories) setCategoryTree(data.categories);
            } catch (e) {
                console.error(e);
            }
        }
        fetchCats();
    }, []);



    useEffect(() => {

        setFilters((prev) => ({
            ...prev,
            category: searchParams.category || "",
            search: searchParams.search || "",
            sort: searchParams.sort || "new",
            minPrice: searchParams.minPrice || "",
            maxPrice: searchParams.maxPrice || "",
            minDiscount: searchParams.minDiscount || "",
            maxDiscount: searchParams.maxDiscount || "",
        }));
        setCurrentPage(1);
    }, [searchParams]);

    useEffect(() => {
        if (!filters.category || categoryTree.length === 0) return;
        const match = findCategoryInTree(categoryTree, filters.category);
        if (match && match.name !== filters.category) {
            router.replace(
                productsLink({
                    category: match.name,
                    search: filters.search || undefined,
                    sort: filters.sort !== "new" ? filters.sort : undefined,
                    minPrice: filters.minPrice || undefined,
                    maxPrice: filters.maxPrice || undefined,
                    minDiscount: filters.minDiscount || undefined,
                    maxDiscount: filters.maxDiscount || undefined,
                })
            );
        }
    }, [categoryTree, filters.category, filters.search, filters.sort, router]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);

            try {

                const query = new URLSearchParams({
                    page: String(currentPage),
                    limit: "12",
                    sort: filters.sort,
                });
                if (filters.category) query.set("category", filters.category);
                if (filters.search) query.set("search", filters.search);
                if (filters.minPrice) query.set("minPrice", filters.minPrice);
                if (filters.maxPrice) query.set("maxPrice", filters.maxPrice);
                if (filters.minDiscount) query.set("minDiscount", filters.minDiscount);
                if (filters.maxDiscount) query.set("maxDiscount", filters.maxDiscount);

                const res = await fetch(`/api/products?${query.toString()}`);
                const data = await res.json();

                if (!res.ok) {
                    setProducts([]);
                    setTotalPages(1);
                    toast.error(data.error || "Failed to load products");
                    return;
                }

                if (data.products) {
                    setProducts(data.products);
                    setTotalPages(Math.max(1, Math.ceil((data.total || 0) / 12)));
                    if (data.priceBounds) setPriceBounds(data.priceBounds);
                }

            } catch (error) {

                console.error(error);

                toast.error("Failed to load products");

            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [filters, currentPage]);



    const pushFilters = (next) => {
        router.push(
            productsLink({
                category: next.category || undefined,
                search: next.search || undefined,
                sort: next.sort && next.sort !== "new" ? next.sort : undefined,
                minPrice: next.minPrice || undefined,
                maxPrice: next.maxPrice || undefined,
                minDiscount: next.minDiscount || undefined,
                maxDiscount: next.maxDiscount || undefined,
            })
        );
    };



    const handleCategoryChange = (categoryName) => {

        const next = { ...filters, category: categoryName };

        setFilters(next);

        setCurrentPage(1);

        setMobileFiltersOpen(false);

        pushFilters(next);

    };



    const handleSortChange = (sort) => {

        const next = { ...filters, sort };

        setFilters(next);

        setCurrentPage(1);

        pushFilters(next);

    };



    const handlePriceApply = (minPrice, maxPrice) => {
        const next = { ...filters, minPrice, maxPrice };
        setFilters(next);
        setCurrentPage(1);
        setMobileFiltersOpen(false);
        pushFilters(next);
    };



    const clearFilters = () => {

        const empty = { category: "", search: "", sort: "new", minPrice: "", maxPrice: "", minDiscount: "", maxDiscount: "" };

        setFilters(empty);

        setCurrentPage(1);

        router.push("/products");

    };



    const categoryPath = filters.category
        ? findCategoryPathInTree(categoryTree, filters.category) || [filters.category]
        : [];

    const subcategories = filters.category
        ? getSubcategoryNavItems(categoryTree, filters.category)
        : [];

    const pageTitle = filters.search
        ? `Results for "${filters.search}"`
        : categoryPath.length
          ? categoryPath[categoryPath.length - 1]
          : "All Products";



    return (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 w-full min-w-0">

            {(filters.category || filters.search) && (
                <header className="mb-8 md:mb-10 border-b border-gray-100 pb-6 md:pb-8">
                    {filters.category && categoryPath.length > 0 && (
                        <nav
                            className={`flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 ${BREADCRUMB_CLASS}`}
                            aria-label="Breadcrumb"
                        >
                            <Link href="/" className="hover:opacity-70 transition-opacity">
                                Home
                            </Link>
                            {categoryPath.map((name, index) => {
                                const isLast = index === categoryPath.length - 1;
                                return (
                                    <span key={`${name}-${index}`} className="inline-flex items-center gap-2">
                                        <span className="text-[#212529] select-none" aria-hidden>
                                            &gt;
                                        </span>
                                        {isLast ? (
                                            <span className="text-[#212529]">{name}</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleCategoryChange(name)}
                                                className="hover:opacity-70 transition-opacity text-left"
                                            >
                                                {name}
                                            </button>
                                        )}
                                    </span>
                                );
                            })}
                        </nav>
                    )}

                    <h1 className="text-3xl md:text-[2.5rem] leading-tight font-semibold uppercase tracking-[0.14em] text-gray-900">
                        {pageTitle}
                    </h1>

                    {subcategories.length > 0 && (
                        <nav
                            className="mt-5 md:mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-[15px] font-medium uppercase tracking-[0.12em] text-gray-800"
                            aria-label="Subcategories"
                        >
                            {subcategories.map((name, index) => {
                                const isActive =
                                    filters.category?.toLowerCase() === name.toLowerCase();
                                return (
                                    <span key={name} className="inline-flex items-center gap-4">
                                        {index > 0 && (
                                            <span className="text-gray-300 font-light select-none" aria-hidden>
                                                |
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleCategoryChange(name)}
                                            className={`transition-colors hover:text-black ${
                                                isActive ? "text-black font-semibold" : "text-gray-600"
                                            }`}
                                        >
                                            {name}
                                        </button>
                                    </span>
                                );
                            })}
                        </nav>
                    )}
                </header>
            )}

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 min-w-0">

                <ProductFilterSidebar

                    categoryTree={categoryTree}

                    activeCategory={filters.category}

                    minPrice={filters.minPrice}

                    maxPrice={filters.maxPrice}

                    onCategoryChange={handleCategoryChange}

                    onPriceApply={handlePriceApply}
                    priceBounds={priceBounds}

                    onClear={clearFilters}

                    mobileOpen={mobileFiltersOpen}

                    onMobileClose={() => setMobileFiltersOpen(false)}

                />



                <div className="flex-1 min-w-0">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                        {!filters.category && !filters.search && (
                            <div>
                                <h1 className="text-3xl md:text-[2.5rem] leading-tight font-semibold uppercase tracking-[0.14em] text-gray-900">
                                    {pageTitle}
                                </h1>
                                <p className="text-gray-500 mt-2 text-base">
                                    Explore our latest collection
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto sm:ml-auto">
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden inline-flex items-center gap-1.5 text-sm md:text-[15px] font-semibold uppercase tracking-[0.14em] text-gray-900 hover:text-black"
                            >
                                Filter
                                <span className="text-base leading-none">+</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline text-sm md:text-[15px] font-semibold uppercase tracking-[0.14em] text-gray-900">
                                    Sort
                                </span>
                                <span className="hidden sm:inline text-base leading-none text-gray-900">+</span>
                                <StyledSelect
                                    className="w-full sm:w-auto sm:min-w-[200px]"
                                    value={filters.sort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    options={SORT_OPTIONS}
                                    aria-label="Sort products"
                                    size="md"
                                />
                            </div>
                        </div>
                    </div>

                    {(filters.minPrice || filters.maxPrice) && (
                        <div className="flex flex-wrap items-center gap-2.5 mb-6">
                            <span className="text-sm text-gray-500 uppercase tracking-[0.1em] font-medium">
                                Active filters:
                            </span>
                            {(filters.minPrice || filters.maxPrice) && (
                                <button
                                    type="button"
                                    onClick={() => handlePriceApply("", "")}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-full"
                                >
                                    Rs. {filters.minPrice || priceBounds?.min || 0} – {filters.maxPrice || priceBounds?.max || "∞"}
                                    <span className="opacity-70">×</span>
                                </button>
                            )}
                        </div>
                    )}



                    {loading ? (

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">

                            {[1, 2, 3, 4, 5, 6].map((i) => (

                                <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />

                            ))}

                        </div>

                    ) : products.length === 0 ? (

                        <div className="py-20 text-center text-gray-400">

                            <Filter className="w-10 h-10 mx-auto mb-4 opacity-30" />

                            <p className="text-xl md:text-2xl">No products found matching your criteria.</p>

                            <button
                                onClick={clearFilters}
                                className="mt-4 text-black underline hover:no-underline text-base font-semibold"
                            >

                                Clear Filters

                            </button>

                        </div>

                    ) : (

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">

                            {products.map((product) => (

                                <ProductCard key={product._id} product={product} />

                            ))}

                        </div>

                    )}



                    {totalPages > 1 && (

                        <div className="mt-12 flex justify-center gap-2">

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (

                                <button

                                    key={page}

                                    onClick={() => setCurrentPage(page)}

                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${

                                        currentPage === page

                                            ? "bg-black text-white"

                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"

                                    }`}

                                >

                                    {page}

                                </button>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

