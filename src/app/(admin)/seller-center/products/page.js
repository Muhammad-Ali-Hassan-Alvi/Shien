"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import DeleteModal from "@/components/admin/DeleteModal";
import Pagination from "@/components/admin/Pagination";
import Loader from "@/components/admin/Loader";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteState, setDeleteState] = useState({ isOpen: false, id: null, isDeleting: false });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?limit=100'); // Fetches reasonable batch
            const json = await res.json();
            if (json.products) setProducts(json.products);
        } catch (err) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const openDelete = (id) => {
        setDeleteState({ isOpen: true, id, isDeleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteState.id) return;

        setDeleteState(prev => ({ ...prev, isDeleting: true }));
        const toastId = toast.loading("Deleting...");

        try {
            const res = await fetch(`/api/products?id=${deleteState.id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p._id !== deleteState.id));
                toast.success("Deleted successfully", { id: toastId });
                setDeleteState({ isOpen: false, id: null, isDeleting: false });
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            toast.error("Error deleting", { id: toastId });
            setDeleteState(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const paginatedProducts = products.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your product catalog ({products.length})</p>
                </div>
                <Link
                    href="/seller-center/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 font-medium"
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-1">
                <div className="overflow-x-auto scrollbar-hide">
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
                            {paginatedProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-md bg-gray-100 relative overflow-hidden flex-shrink-0">
                                                {product.images?.[0] ? (
                                                    <Image src={product.images[0]} fill className="object-cover" alt={product.name} />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm truncate max-w-[200px] block" title={product.name}>{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Rs. {product.pricing?.salePrice}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {product.variants?.[0]?.stock}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/product/${product.slug}`}
                                                target="_blank"
                                                className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-400 transition-colors"
                                                title="View Live"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <Link
                                                href={`/seller-center/products/edit/${product._id}`}
                                                className="p-2 hover:bg-green-50 hover:text-green-600 rounded-lg text-gray-400 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => openDelete(product._id)}
                                                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No products found.</div>
                ) : (
                    <div className="px-4 pb-4">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={products.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            <DeleteModal
                isOpen={deleteState.isOpen}
                onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                isDeleting={deleteState.isDeleting}
                title="Delete Product"
                message="Are you sure you want to delete this product? This will remove it from the catalog permanently."
            />
        </div>
    );
}
