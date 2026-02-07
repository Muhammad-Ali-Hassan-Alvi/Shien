"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Filter, ChevronDown, ShoppingBag } from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/admin/Pagination";
// Reuse reusable components or generic ones

export default function ShopPage({ searchParams }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: searchParams.category || "",
        sort: searchParams.sort || "new",
        minPrice: "",
        maxPrice: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch Categories
    useEffect(() => {
        async function fetchCats() {
            try {
                const res = await fetch("/api/categories");
                const data = await res.json();
                if (data.categories) setCategories(data.categories);
            } catch (e) { console.error(e); }
        }
        fetchCats();
    }, []);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    page: currentPage,
                    limit: 12,
                    sort: filters.sort,
                    ...(filters.category && { category: filters.category }),
                    // API might not support minPrice/maxPrice yet, need to implement filtering logic
                });

                const res = await fetch(`/api/products?${query.toString()}`);
                const data = await res.json();

                if (data.products) {
                    // Manual Client Side filtering for price if API doesn't support it 
                    // (Note: API route modification is ideal, but for now client filtering on the fetched page)
                    let filtered = data.products;
                    if (filters.minPrice) filtered = filtered.filter(p => p.pricing.salePrice >= Number(filters.minPrice));
                    if (filters.maxPrice) filtered = filtered.filter(p => p.pricing.salePrice <= Number(filters.maxPrice));

                    setProducts(filtered);
                    setTotalPages(Math.ceil(data.total / 12));
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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                <div>
                    <h1 className="text-4xl font-playfair font-bold text-gray-900">All Products</h1>
                    <p className="text-gray-500 mt-2">Explore our latest collection</p>
                </div>

                {/* Filters & Sort */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Category */}
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm bg-transparent outline-none focus:ring-1 focus:ring-black"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>

                    {/* Sort */}
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm bg-transparent outline-none focus:ring-1 focus:ring-black"
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                        <option value="new">Newest Arrivals</option>
                        <option value="bestsellers">Best Sellers</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>

                    {/* Price Range (Simple Inputs) */}
                    <div className="flex items-center gap-2">
                        <input
                            placeholder="Min"
                            className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            placeholder="Max"
                            className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse"></div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                    <p className="text-xl">No products found matching your criteria.</p>
                    <button onClick={() => setFilters({ category: "", sort: "new", minPrice: "", maxPrice: "" })} className="mt-4 text-black underline hover:no-underline">Clear Filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {products.map((product) => (
                        <Link href={`/product/${product.slug}`} key={product._id} className="group">
                            <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-100">
                                {product.images?.[0] && (
                                    <Image
                                        src={product.images[0]}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={product.name}
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                )}
                                {product.pricing.discountLabel && (
                                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                                        {product.pricing.discountLabel}
                                    </span>
                                )}
                                {/* Quick Action - Add to Cart (Optional) */}
                                <div className="absolute bottom-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <button className="bg-white p-3 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors">
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 group-hover:underline decoration-1 underline-offset-4 truncate">{product.name}</h3>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">Rs. {product.pricing.salePrice.toLocaleString()}</span>
                                {product.pricing.salePrice < product.pricing.originalPrice && (
                                    <span className="text-xs text-gray-400 line-through">Rs. {product.pricing.originalPrice.toLocaleString()}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentPage === page ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
