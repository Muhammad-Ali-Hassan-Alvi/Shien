"use client";



import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { Filter, SlidersHorizontal } from "lucide-react";

import { toast } from "react-hot-toast";

import { use } from "react";

import ProductCard from "@/components/ProductCard";

import StyledSelect from "@/components/ui/StyledSelect";

import ProductFilterSidebar from "@/components/ProductFilterSidebar";

import { productsLink } from "@/app/lib/navLinks";

import { findCategoryInTree } from "@/app/lib/categoryUtils";



const SORT_OPTIONS = [

    { value: "new", label: "Newest Arrivals" },

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

        const empty = { category: "", search: "", sort: "new", minPrice: "", maxPrice: "" };

        setFilters(empty);

        setCurrentPage(1);

        router.push("/products");

    };



    const activeCat = filters.category

        ? findCategoryInTree(categoryTree, filters.category)

        : null;



    const pageTitle = filters.search

        ? `Results for "${filters.search}"`

        : activeCat

          ? activeCat.name

          : "All Products";



    return (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12 w-full min-w-0">

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

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">

                        <div>

                            <h1 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900">

                                {pageTitle}

                            </h1>

                            <p className="text-gray-500 mt-1 text-sm md:text-base">

                                {filters.category

                                    ? "Browse products in this category"

                                    : "Explore our latest collection"}

                            </p>

                        </div>



                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

                            <button

                                type="button"

                                onClick={() => setMobileFiltersOpen(true)}

                                className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50"

                            >

                                <SlidersHorizontal size={16} />

                                Filters

                            </button>

                            <StyledSelect

                                className="w-full sm:w-auto sm:min-w-[180px]"

                                value={filters.sort}

                                onChange={(e) => handleSortChange(e.target.value)}

                                options={SORT_OPTIONS}

                                aria-label="Sort products"

                            />

                        </div>

                    </div>



                    {(filters.category || filters.minPrice || filters.maxPrice) && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Active filters:</span>
                            {filters.category && (
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange("")}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full"
                                >
                                    {activeCat?.name || filters.category}
                                    <span className="opacity-70">×</span>
                                </button>
                            )}
                            {(filters.minPrice || filters.maxPrice) && (
                                <button
                                    type="button"
                                    onClick={() => handlePriceApply("", "")}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full"
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

                            <p className="text-xl">No products found matching your criteria.</p>

                            <button

                                onClick={clearFilters}

                                className="mt-4 text-black underline hover:no-underline text-sm font-semibold"

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

