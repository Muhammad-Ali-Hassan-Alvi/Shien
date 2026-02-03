"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import Image from "next/image";

const MOCK_PRODUCTS = [
    { id: 1, name: "Floral Print Sundress", price: 12.99, stock: 120, category: "Dresses", status: "Active", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
    { id: 2, name: "High Waist Denim Shorts", price: 18.50, stock: 45, category: "Bottoms", status: "Active", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
    { id: 3, name: "Striped Cotton Shirt", price: 24.00, stock: 0, category: "Tops", status: "Out of Stock", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
];

export default function ProductsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your product catalog</p>
                </div>
                <Link
                    href="/seller-center/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 font-medium"
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none outline-none rounded-lg text-sm focus:ring-1 focus:ring-black/5"
                    />
                </div>
                <select className="px-4 py-2 bg-gray-50 border-none text-sm rounded-lg outline-none cursor-pointer">
                    <option>All Categories</option>
                    <option>Dresses</option>
                    <option>Tops</option>
                </select>
                <select className="px-4 py-2 bg-gray-50 border-none text-sm rounded-lg outline-none cursor-pointer">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Draft</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Stock</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {MOCK_PRODUCTS.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md bg-gray-100 relative overflow-hidden">
                                            <Image src={product.image} fill className="object-cover" alt={product.name} />
                                        </div>
                                        <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
