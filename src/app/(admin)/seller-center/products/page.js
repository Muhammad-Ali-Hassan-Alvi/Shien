"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Filter, Save, X } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Loader from "@/components/admin/Loader";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingProduct, setEditingProduct] = useState(null); // Product being edited

    // Fetch Categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                const data = await res.json();
                if (data.categories) setCategories(data.categories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        }
        fetchCategories();
    }, []);

    // Fetch Products
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                let url = `/api/products?limit=100`;
                if (selectedCategory !== "All") {
                    url += `&category=${encodeURIComponent(selectedCategory)}`;
                }

                const res = await fetch(url);
                const data = await res.json();
                if (data.products) setProducts(data.products);
            } catch (error) {
                console.error("Failed to fetch products", error);
                toast.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [selectedCategory]);

    // Handle Category Update
    const handleUpdateCategory = async (productId, newCategory) => {
        try {
            const res = await fetch(`/api/products?id=${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: newCategory }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Category updated successfully!");
                // Update local state
                setProducts(products.map(p =>
                    p._id === productId ? { ...p, category: newCategory } : p
                ));
                setEditingProduct(null);
            } else {
                toast.error(data.error || "Failed to update category");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Error updating category");
        }
    };

    // Filtered Products (Client-side search)
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and categorize your inventory</p>
                </div>
                <Link
                    href="/seller-center/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 font-medium"
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Control Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none outline-none rounded-lg text-sm focus:ring-1 focus:ring-black/5 transition-all"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 md:w-48 px-4 py-2 bg-gray-50 border-none text-sm rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-black/5"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Stock</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="5">
                                    <Loader />
                                </td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-md bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                                                {product.images?.[0] ? (
                                                    <Image src={product.images[0]} fill className="object-cover" alt={product.name} sizes="40px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]" title={product.name}>{product.name}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {editingProduct === product._id ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="text-xs border border-gray-300 rounded p-1 outline-none"
                                                    defaultValue={product.category}
                                                    onChange={(e) => handleUpdateCategory(product._id, e.target.value)}
                                                    onBlur={() => setEditingProduct(null)} // Close on blur/selection
                                                    autoFocus
                                                >
                                                    {categories.map(c => (
                                                        <option key={c._id} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <span
                                                className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200"
                                                onClick={() => setEditingProduct(product._id)}
                                                title="Click to edit category"
                                            >
                                                {product.category}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        Rs. {product.pricing?.salePrice?.toLocaleString()}
                                        {product.pricing?.discountLabel && (
                                            <span className="ml-2 text-[10px] text-red-500 bg-red-50 px-1 py-0.5 rounded">{product.pricing.discountLabel}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {/* Sum stock of first variant or show total if computed */}
                                        {product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/seller-center/products/${product._id}`}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                title="Edit Product"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors" title="Delete Product (Not Implemented)">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}

                    </tbody>
                </table>
            </div>

        </div>
    );
}
