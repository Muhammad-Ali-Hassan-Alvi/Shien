"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Filter, RotateCcw, FolderInput } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Loader from "@/components/admin/Loader";
import DeleteModal from "@/components/admin/DeleteModal";
import MoveCategoryModal from "@/components/admin/MoveCategoryModal";
import StyledSelect from "@/components/ui/StyledSelect";
import {
    buildCategorySelectOptions,
    formatCategoryBreadcrumb,
} from "@/app/lib/categoryUtils";

function productIdStr(product) {
    const id = product?._id;
    return typeof id === "string" ? id : id?.toString?.() ?? String(id);
}

function shouldShowDiscountLabel(label) {
    if (!label) return false;
    const n = String(label).replace(/%/g, "").trim();
    const pct = parseFloat(n);
    return !Number.isNaN(pct) && pct > 0;
}

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categoryTree, setCategoryTree] = useState([]);
    const [categoryFilterOptions, setCategoryFilterOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState("active"); // active | recycle
    const [moveModal, setMoveModal] = useState(null); // { products: [...] }
    const [modal, setModal] = useState(null); // single product or bulk ids
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState(() => new Set());

    // Fetch categories (flat filter + tree for move picker)
    useEffect(() => {
        async function fetchCategories() {
            try {
                const treeRes = await fetch("/api/categories?tree=true&admin=true");
                const treeData = await treeRes.json();
                if (treeData.categories) {
                    setCategoryTree(treeData.categories);
                    setCategoryFilterOptions(buildCategorySelectOptions(treeData.categories));
                }
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
                let url = `/api/products?limit=100&includeStats=true`;
                if (view === "recycle") {
                    url += "&archived=true";
                }
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
        setSelectedIds(new Set());
    }, [selectedCategory, view]);

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleConfirmModal = async () => {
        if (!modal) return;

        const isBulk = Array.isArray(modal.productIds) && modal.productIds.length > 0;
        const ids = isBulk
            ? modal.productIds
            : modal.product
              ? [productIdStr(modal.product)]
              : [];

        if (ids.length === 0) return;

        setActionLoading(true);
        try {
            const actions = await import("@/app/lib/product-actions");
            let res;

            if (modal.type === "archive") {
                res = isBulk
                    ? await actions.archiveProductsBulk(ids)
                    : await actions.archiveProduct(ids[0]);
            } else if (modal.type === "restore") {
                res = isBulk
                    ? await actions.restoreProductsBulk(ids)
                    : await actions.restoreProduct(ids[0]);
            } else {
                res = isBulk
                    ? await actions.deleteProductsPermanentlyBulk(ids)
                    : await actions.deleteProductPermanently(ids[0]);
            }

            if (res.success) {
                const count = res.succeeded ?? ids.length;
                const messages = {
                    archive: isBulk
                        ? `${count} product(s) moved to recycle bin`
                        : "Moved to recycle bin",
                    restore: isBulk
                        ? `${count} product(s) restored`
                        : "Product restored",
                    permanent: isBulk
                        ? `${count} product(s) permanently deleted`
                        : "Product permanently deleted",
                };
                toast.success(messages[modal.type]);
                if (res.failed > 0) {
                    toast.error(`${res.failed} item(s) could not be processed`);
                }
                const idSet = new Set(ids);
                setProducts((prev) => prev.filter((p) => !idSet.has(productIdStr(p))));
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    ids.forEach((id) => next.delete(id));
                    return next;
                });
                setModal(null);
            } else {
                toast.error(res.error || "Action failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setActionLoading(false);
        }
    };

    const openMoveModal = (productList) => {
        if (!productList?.length) return;
        setMoveModal({
            products: productList.map((p) => ({
                _id: productIdStr(p),
                name: p.name,
                category: p.category,
            })),
        });
    };

    const handleMoveToCategory = async (newCategory) => {
        if (!moveModal?.products?.length) return;

        const ids = moveModal.products.map((p) => p._id);
        let succeeded = 0;

        for (const id of ids) {
            try {
                const res = await fetch(`/api/products?id=${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ category: newCategory }),
                });
                const data = await res.json();
                if (res.ok) succeeded += 1;
                else toast.error(data.error || `Failed to move product`);
            } catch {
                toast.error("Error updating category");
            }
        }

        if (succeeded > 0) {
            const idSet = new Set(ids);
            setProducts((prev) =>
                prev
                    .map((p) =>
                        idSet.has(productIdStr(p)) ? { ...p, category: newCategory } : p
                    )
                    .filter((p) => {
                        if (selectedCategory === "All") return true;
                        return p.category === selectedCategory;
                    })
            );
            toast.success(
                succeeded === 1
                    ? "Product moved to new category"
                    : `${succeeded} products moved to "${newCategory}"`
            );
            setMoveModal(null);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                ids.forEach((id) => next.delete(id));
                return next;
            });
        }
    };

    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // Filtered Products (Client-side search)
    let filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort Logic
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    filteredProducts.sort((a, b) => {
        if (sortConfig.key === 'salePrice') {
            return sortConfig.direction === 'asc'
                ? (a.pricing?.salePrice || 0) - (b.pricing?.salePrice || 0)
                : (b.pricing?.salePrice || 0) - (a.pricing?.salePrice || 0);
        }
        if (sortConfig.key === 'createdAt') {
            // createdAt might not be populated in current API response, let's check
            // If not, we might fallback to _id timestamp or assume default sort
            // Assuming created date exists or using ID
            return sortConfig.direction === 'asc'
                ? (a.createdAt || 0) > (b.createdAt || 0) ? 1 : -1
                : (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1;
        }
        if (sortConfig.key === 'stock') {
            const stockA = a.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
            const stockB = b.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
            return sortConfig.direction === 'asc' ? stockA - stockB : stockB - stockA;
        }
        if (sortConfig.key === 'wishlist') {
            return sortConfig.direction === 'asc'
                ? (a.wishlistCount || 0) - (b.wishlistCount || 0)
                : (b.wishlistCount || 0) - (a.wishlistCount || 0);
        }
        return 0;
    });

    const visibleIds = filteredProducts.map(productIdStr);
    const selectedCount = selectedIds.size;
    const selectedOnPage = visibleIds.filter((id) => selectedIds.has(id)).length;
    const allVisibleSelected =
        visibleIds.length > 0 && selectedOnPage === visibleIds.length;
    const someVisibleSelected = selectedOnPage > 0 && !allVisibleSelected;

    const toggleSelectAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allVisibleSelected) {
                visibleIds.forEach((id) => next.delete(id));
            } else {
                visibleIds.forEach((id) => next.add(id));
            }
            return next;
        });
    };

    const openBulkModal = (type) => {
        const productIds = [...selectedIds];
        if (productIds.length === 0) return;
        setModal({ type, productIds, bulk: true });
    };

    const modalCount = modal?.productIds?.length ?? (modal?.product ? 1 : 0);

    return (
        <div className="space-y-6 relative">
            {/* ... control bar ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Header code */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {view === "recycle"
                            ? "Restore items or delete them permanently"
                            : "Manage and categorize your inventory"}
                    </p>
                </div>
                {view === "active" && (
                    <Link
                        href="/seller-center/products/new"
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 font-medium"
                    >
                        <Plus size={18} />
                        Add Product
                    </Link>
                )}
            </div>

            <div className="flex gap-2 border-b border-gray-100">
                <button
                    type="button"
                    onClick={() => setView("active")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        view === "active"
                            ? "border-black text-gray-900"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Active products
                </button>
                <button
                    type="button"
                    onClick={() => setView("recycle")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        view === "recycle"
                            ? "border-black text-gray-900"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Recycle bin
                </button>
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
                    <StyledSelect
                        className="flex-1 md:w-52"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        options={[
                            { value: "All", label: "All Categories" },
                            ...categoryFilterOptions,
                        ]}
                        aria-label="Filter by category"
                        menuClassName="max-h-64 overflow-y-auto"
                    />
                </div>
            </div>

            {selectedCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg">
                    <span className="text-sm font-medium">
                        {selectedCount} selected
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedIds(new Set())}
                            className="px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            Clear
                        </button>
                        {view === "active" ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const list = products.filter((p) =>
                                            selectedIds.has(productIdStr(p))
                                        );
                                        openMoveModal(list);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                >
                                    <FolderInput size={14} />
                                    Move category
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openBulkModal("archive")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 size={14} />
                                    Move to recycle bin
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openBulkModal("restore")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                                >
                                    <RotateCcw size={14} />
                                    Restore
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openBulkModal("permanent")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 size={14} />
                                    Delete forever
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto overflow-y-visible admin-table-scroll">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={allVisibleSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = someVisibleSelected;
                                    }}
                                    onChange={toggleSelectAll}
                                    disabled={loading || visibleIds.length === 0}
                                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black/20 cursor-pointer disabled:opacity-40"
                                    aria-label="Select all products on this page"
                                />
                            </th>
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('salePrice')}>
                                Price {sortConfig.key === 'salePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('wishlist')}>
                                Wishlist {sortConfig.key === 'wishlist' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stock')}>
                                Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="7">
                                    <Loader />
                                </td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    {view === "recycle" ? "Recycle bin is empty." : "No products found."}
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => {
                                const id = productIdStr(product);
                                const isSelected = selectedIds.has(id);
                                const categoryBreadcrumb = formatCategoryBreadcrumb(
                                    categoryTree,
                                    product.category
                                );
                                return (
                                <tr
                                    key={id}
                                    className={`hover:bg-gray-50 transition-colors group ${isSelected ? "bg-blue-50/50" : ""}`}
                                >
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(id)}
                                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black/20 cursor-pointer"
                                            aria-label={`Select ${product.name}`}
                                        />
                                    </td>
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
                                                <p
                                                    className="font-medium text-gray-900 text-sm truncate max-w-[220px]"
                                                    title={product.name}
                                                >
                                                    {product.name}
                                                </p>
                                                {product.slug && (
                                                    <p
                                                        className="text-[10px] text-gray-400 font-mono truncate max-w-[220px] mt-0.5"
                                                        title={product.slug}
                                                    >
                                                        SKU: {product.slug.toUpperCase()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm max-w-[240px]">
                                        <button
                                            type="button"
                                            onClick={() => openMoveModal([product])}
                                            className="text-left w-full text-xs text-gray-700 hover:text-indigo-600 transition-colors truncate"
                                            title={`${categoryBreadcrumb} — click to move`}
                                        >
                                            {categoryBreadcrumb}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                        Rs. {product.pricing?.salePrice?.toLocaleString()}
                                        {shouldShowDiscountLabel(product.pricing?.discountLabel) && (
                                            <span className="ml-2 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-semibold">
                                                {product.pricing.discountLabel}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {product.wishlistCount || 0}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {/* Sum stock of first variant or show total if computed */}
                                        {product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {view === "active" ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openMoveModal([product])}
                                                        className="p-2 hover:bg-indigo-50 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
                                                        title="Move to category"
                                                    >
                                                        <FolderInput size={16} />
                                                    </button>
                                                    <Link
                                                        href={`/seller-center/products/edit/${productIdStr(product)}`}
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setModal({ type: "archive", product })
                                                        }
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                                        title="Move to recycle bin"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setModal({ type: "restore", product })
                                                        }
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors"
                                                        title="Restore product"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setModal({ type: "permanent", product })
                                                        }
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                                        title="Delete permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                            })
                        )}

                    </tbody>
                </table>
            </div>

            <MoveCategoryModal
                isOpen={!!moveModal}
                onClose={() => setMoveModal(null)}
                products={moveModal?.products ?? []}
                categoryTree={categoryTree}
                onConfirm={handleMoveToCategory}
            />

            <DeleteModal
                isOpen={!!modal}
                onClose={() => !actionLoading && setModal(null)}
                onConfirm={handleConfirmModal}
                isDeleting={actionLoading}
                title={
                    modal?.bulk
                        ? modal?.type === "archive"
                            ? `Move ${modalCount} products to recycle bin?`
                            : modal?.type === "restore"
                              ? `Restore ${modalCount} products?`
                              : `Delete ${modalCount} products permanently?`
                        : modal?.type === "archive"
                          ? "Move to recycle bin?"
                          : modal?.type === "restore"
                            ? "Restore product?"
                            : "Delete permanently?"
                }
                message={
                    modal?.bulk
                        ? modal?.type === "archive"
                            ? `${modalCount} selected product(s) will be hidden from the shop. You can restore them later from the Recycle bin tab.`
                            : modal?.type === "restore"
                              ? `${modalCount} selected product(s) will be visible on the shop again.`
                              : `${modalCount} selected product(s) will be removed forever. This cannot be undone.`
                        : modal?.type === "archive"
                          ? `"${modal?.product?.name}" will be hidden from the shop. You can restore it later from the Recycle bin tab.`
                          : modal?.type === "restore"
                            ? `"${modal?.product?.name}" will be visible on the shop again.`
                            : `"${modal?.product?.name}" will be removed forever. This cannot be undone.`
                }
                confirmLabel={
                    modal?.type === "archive"
                        ? "Move to bin"
                        : modal?.type === "restore"
                          ? "Restore"
                          : "Delete forever"
                }
                loadingLabel={
                    modal?.type === "archive"
                        ? "Moving..."
                        : modal?.type === "restore"
                          ? "Restoring..."
                          : "Deleting..."
                }
                confirmClassName={
                    modal?.type === "restore"
                        ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                        : "bg-red-600 hover:bg-red-700 shadow-red-200"
                }
            />
        </div>
    );
}
