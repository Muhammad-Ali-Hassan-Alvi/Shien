"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
    ChevronRight,
    ChevronDown,
    Plus,
    FolderPlus,
    Trash2,
    Tag,
    Edit,
    Eye,
    EyeOff,
    Filter,
} from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";
import Loader from "@/components/admin/Loader";
import CategoryUpdateModal from "@/components/admin/CategoryUpdateModal";
import CategorySetupHelp from "@/components/admin/CategorySetupHelp";
import {
    resolveEffectiveVariantSettings,
    flattenCategoriesFlat,
    formatVariantSettingsLabel,
} from "@/app/lib/categoryUtils";

const VISIBILITY_FILTERS = {
    all: "all",
    visible: "visible",
    hidden: "hidden",
};

function sortSiblingsByVisibility(nodes) {
    return [...nodes].sort((a, b) => {
        const aVis = a.isActive !== false ? 0 : 1;
        const bVis = b.isActive !== false ? 0 : 1;
        if (aVis !== bVis) return aVis - bVis;
        return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
    });
}

function sortTreeByVisibility(nodes) {
    const sorted = sortSiblingsByVisibility(nodes);
    return sorted.map((node) => ({
        ...node,
        children: node.children?.length ? sortTreeByVisibility(node.children) : [],
    }));
}

function filterTreeByVisibility(nodes, mode) {
    if (mode === VISIBILITY_FILTERS.all) {
        return sortTreeByVisibility(nodes);
    }

    return nodes.reduce((acc, node) => {
        const isVisible = node.isActive !== false;
        const filteredChildren = filterTreeByVisibility(node.children || [], mode);

        if (mode === VISIBILITY_FILTERS.visible) {
            if (isVisible) {
                acc.push({ ...node, children: filteredChildren });
            } else if (filteredChildren.length > 0) {
                acc.push(...filteredChildren);
            }
        } else if (mode === VISIBILITY_FILTERS.hidden) {
            if (!isVisible) {
                acc.push({ ...node, children: filteredChildren });
            } else if (filteredChildren.length > 0) {
                acc.push(...filteredChildren);
            }
        }

        return acc;
    }, []);
}

function partitionRootSections(nodes) {
    const visible = [];
    const hidden = [];

    for (const node of nodes) {
        if (node.isActive !== false) visible.push(node);
        else hidden.push(node);
    }

    return {
        visible: sortSiblingsByVisibility(visible),
        hidden: sortSiblingsByVisibility(hidden),
    };
}

function CategoryTreeNode({
    node,
    parentNode,
    depth,
    expanded,
    onToggle,
    onEdit,
    onDelete,
    onAddChild,
    onToggleVisibility,
    flatCategories,
}) {
    const hasChildren = node.children?.length > 0;
    const isExpanded = expanded.has(node._id);
    const isVisible = node.isActive !== false;
    const variantLabel = formatVariantSettingsLabel(
        resolveEffectiveVariantSettings(flatCategories, node.name)
    );

    return (
        <div>
            <div
                className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    !isVisible ? "opacity-70 bg-gray-50/80" : ""
                }`}
                style={{ paddingLeft: `${depth * 20 + 12}px` }}
            >
                <button
                    type="button"
                    onClick={() => hasChildren && onToggle(node._id)}
                    className={`w-5 h-5 flex items-center justify-center shrink-0 ${hasChildren ? "text-gray-500" : "invisible"}`}
                >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <Tag size={14} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{node.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        {node.isLine && (
                            <span className="text-indigo-600 font-bold uppercase tracking-wide">Line</span>
                        )}
                        {!isVisible && (
                            <span className="text-red-500 font-medium">Hidden from shop</span>
                        )}
                        {parentNode && parentNode.isActive === false && isVisible && (
                            <span className="text-orange-500">Parent hidden</span>
                        )}
                        {!node.showInNav && isVisible && (
                            <span className="text-amber-500">Hidden from top nav</span>
                        )}
                        <span className="text-indigo-500">{variantLabel}</span>
                        {node.customVariantSettings && (
                            <span className="text-violet-600 font-medium">Custom rules</span>
                        )}
                        {hasChildren && <span>{node.children.length} sub</span>}
                    </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => onToggleVisibility(node)}
                        className={`p-1.5 rounded-md transition-colors ${
                            isVisible
                                ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                : "text-red-500 hover:text-red-700 hover:bg-red-50"
                        }`}
                        title={
                            isVisible
                                ? "Hide from storefront (nav, filters, products)"
                                : "Show on storefront"
                        }
                        aria-label={isVisible ? "Hide category from shop" : "Show category on shop"}
                    >
                        {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => onAddChild(node)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md"
                        title="Add subcategory"
                    >
                        <FolderPlus size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(node)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit"
                    >
                        <Edit size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(node._id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div>
                    {node.children.map((child) => (
                        <CategoryTreeNode
                            key={child._id}
                            node={child}
                            parentNode={node}
                            depth={depth + 1}
                            expanded={expanded}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            onToggleVisibility={onToggleVisibility}
                            flatCategories={flatCategories}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CategorySection({ title, subtitle, accent, nodes, emptyMessage, ...nodeProps }) {
    if (!nodes.length) return null;

    return (
        <div>
            <div
                className={`px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-2 ${accent}`}
            >
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700">{title}</p>
                    {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                <span className="text-[11px] font-bold text-gray-400">{nodes.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
                {nodes.map((node) => (
                    <CategoryTreeNode key={node._id} node={node} depth={0} {...nodeProps} />
                ))}
            </div>
        </div>
    );
}

export default function CategoriesPage() {
    const [categoryTree, setCategoryTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCat, setNewCat] = useState("");
    const [adding, setAdding] = useState(false);
    const [addingUnder, setAddingUnder] = useState(null);
    const [expanded, setExpanded] = useState(new Set());
    const [visibilityFilter, setVisibilityFilter] = useState(VISIBILITY_FILTERS.all);
    const [bulkUpdating, setBulkUpdating] = useState(false);

    const [editModal, setEditModal] = useState(null);
    const [deleteState, setDeleteState] = useState({ isOpen: false, id: null, isDeleting: false });

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories?tree=true&admin=true");
            const json = await res.json();
            if (res.status === 401) {
                toast.error("Session expired. Please sign in again at /admin/login");
                window.location.href = "/admin/login";
                return;
            }
            if (json.categories) setCategoryTree(json.categories);
            else if (json.error) toast.error(json.error);
        } catch {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const displayTree = useMemo(
        () => filterTreeByVisibility(categoryTree, visibilityFilter),
        [categoryTree, visibilityFilter]
    );

    const rootSections = useMemo(() => {
        if (visibilityFilter !== VISIBILITY_FILTERS.all) return null;
        return partitionRootSections(displayTree);
    }, [displayTree, visibilityFilter]);

    const toggleExpand = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleAdd = async (e, parentId = null) => {
        e.preventDefault();
        const name = parentId ? addingUnder?.name : newCat;
        if (!name?.trim()) return;

        setAdding(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), parentId }),
            });

            const json = await res.json();

            if (res.ok) {
                if (parentId) {
                    setAddingUnder(null);
                    setExpanded((prev) => new Set([...prev, parentId]));
                } else {
                    setNewCat("");
                }
                toast.success("Category added!");
                await fetchCategories();
            } else {
                toast.error(json.error || "Failed to add");
            }
        } catch {
            toast.error("Error adding category");
        } finally {
            setAdding(false);
        }
    };

    const handleUpdate = async (categoryId, updates) => {
        const toastId = toast.loading("Updating...");
        try {
            const res = await fetch("/api/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: categoryId, ...updates }),
            });

            const json = await res.json();

            if (res.ok) {
                const extra =
                    json.descendantsDeactivated > 0
                        ? ` (${json.descendantsDeactivated} subcategories also deactivated)`
                        : "";
                toast.success(`Updated!${extra}`, { id: toastId });
                setEditModal((prev) => (prev ? { ...prev, ...updates, name: updates.name ?? prev.name } : null));
                await fetchCategories();
                return true;
            }
            toast.error(json.error || "Failed to update", { id: toastId });
            return false;
        } catch {
            toast.error("Error updating", { id: toastId });
            return false;
        }
    };

    const handleToggleVisibility = async (node) => {
        const isVisible = node.isActive !== false;
        await handleUpdate(node._id, { isActive: !isVisible });
    };

    const handleBulkVisibility = async (isActive) => {
        const label = isActive ? "Showing all categories on shop" : "Hiding all categories from shop";
        if (!confirm(`${label}?\n\nThis updates every category at once.`)) return;

        setBulkUpdating(true);
        const toastId = toast.loading(isActive ? "Showing all..." : "Hiding all...");
        try {
            const res = await fetch("/api/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive }),
            });
            const json = await res.json();
            if (res.ok) {
                toast.success(
                    isActive
                        ? `All ${json.modified} categories are now visible`
                        : `All ${json.modified} categories are now hidden`,
                    { id: toastId }
                );
                await fetchCategories();
            } else {
                toast.error(json.error || "Bulk update failed", { id: toastId });
            }
        } catch {
            toast.error("Bulk update failed", { id: toastId });
        } finally {
            setBulkUpdating(false);
        }
    };

    const handleRemoveProduct = async (productId) => {
        const toastId = toast.loading("Removing product...");
        try {
            const res = await fetch(`/api/products?id=${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: "" }),
            });

            if (res.ok) {
                toast.success("Product removed from category", { id: toastId });
                return true;
            }
            return false;
        } catch {
            toast.error("Failed to remove product", { id: toastId });
            return false;
        }
    };

    const confirmDelete = async () => {
        if (!deleteState.id) return;
        setDeleteState((prev) => ({ ...prev, isDeleting: true }));

        try {
            const res = await fetch(`/api/categories?id=${deleteState.id}`, { method: "DELETE" });
            const json = await res.json();

            if (res.ok) {
                toast.success("Deleted");
                setDeleteState({ isOpen: false, id: null, isDeleting: false });
                await fetchCategories();
            } else {
                toast.error(json.error || "Failed to delete");
                setDeleteState((prev) => ({ ...prev, isDeleting: false }));
            }
        } catch {
            toast.error("Failed to delete");
            setDeleteState((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    if (loading) return <Loader />;

    const flatCategories = flattenCategoriesFlat(categoryTree);

    const nodeProps = {
        expanded,
        onToggle: toggleExpand,
        onEdit: setEditModal,
        onDelete: (id) => setDeleteState({ isOpen: true, id, isDeleting: false }),
        onAddChild: (parent) => setAddingUnder({ parentId: parent._id, name: "" }),
        onToggleVisibility: handleToggleVisibility,
        flatCategories,
    };

    const hasBothSections =
        rootSections &&
        rootSections.visible.length > 0 &&
        rootSections.hidden.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Organize your catalog tree and control size/color options per category type.
                    </p>
                </div>
            </div>

            <CategorySetupHelp />

            <form onSubmit={(e) => handleAdd(e)} className="flex gap-3 max-w-lg">
                <input
                    type="text"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    placeholder="New top-level category (e.g. Woman, Clothing)"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
                <button
                    type="submit"
                    disabled={adding || !newCat.trim()}
                    className="bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400 flex items-center gap-2"
                >
                    <Plus size={16} />
                    {adding ? "Adding..." : "Add"}
                </button>
            </form>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={16} className="text-gray-500 shrink-0" />
                    <span className="text-sm font-semibold text-gray-700">View:</span>
                    {[
                        { id: VISIBILITY_FILTERS.all, label: "All" },
                        { id: VISIBILITY_FILTERS.visible, label: "Visible only" },
                        { id: VISIBILITY_FILTERS.hidden, label: "Hidden only" },
                    ].map((opt) => (
                        <label
                            key={opt.id}
                            className="inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="visibility-filter"
                                checked={visibilityFilter === opt.id}
                                onChange={() => setVisibilityFilter(opt.id)}
                                className="accent-black"
                            />
                            <span className="text-sm text-gray-600">{opt.label}</span>
                        </label>
                    ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:inline">
                        Bulk:
                    </span>
                    <button
                        type="button"
                        disabled={bulkUpdating}
                        onClick={() => handleBulkVisibility(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        title="Show all categories on the shop at once"
                    >
                        <Eye size={14} />
                        Show all
                    </button>
                    <button
                        type="button"
                        disabled={bulkUpdating}
                        onClick={() => handleBulkVisibility(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Hide all categories from the shop at once"
                    >
                        <EyeOff size={14} />
                        Hide all
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {categoryTree.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        No categories yet. Add a top-level category to get started.
                    </div>
                ) : displayTree.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        No categories match this filter.
                    </div>
                ) : hasBothSections ? (
                    <>
                        <CategorySection
                            title="Visible on shop"
                            subtitle="Categories customers can browse"
                            accent="bg-emerald-50/80"
                            nodes={rootSections.visible}
                            {...nodeProps}
                        />
                        <CategorySection
                            title="Hidden from shop"
                            subtitle="Not shown on the storefront"
                            accent="bg-red-50/80"
                            nodes={rootSections.hidden}
                            {...nodeProps}
                        />
                    </>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {displayTree.map((node) => (
                            <CategoryTreeNode
                                key={node._id}
                                node={node}
                                depth={0}
                                {...nodeProps}
                            />
                        ))}
                    </div>
                )}
            </div>

            {addingUnder && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={(e) => handleAdd(e, addingUnder.parentId)}
                        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4"
                    >
                        <h3 className="text-lg font-bold">Add Subcategory</h3>
                        <input
                            autoFocus
                            type="text"
                            value={addingUnder.name}
                            onChange={(e) => setAddingUnder((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Subcategory name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setAddingUnder(null)}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={adding || !addingUnder.name.trim()}
                                className="px-4 py-2 rounded-lg bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-400"
                            >
                                {adding ? "Adding..." : "Add Subcategory"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <CategoryUpdateModal
                isOpen={!!editModal}
                onClose={() => setEditModal(null)}
                category={editModal}
                categoryTree={categoryTree}
                onUpdate={handleUpdate}
                onRemoveProduct={handleRemoveProduct}
            />

            <DeleteModal
                isOpen={deleteState.isOpen}
                onClose={() => setDeleteState((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                isDeleting={deleteState.isDeleting}
                title="Delete Category"
                message="Are you sure? Delete all subcategories first. Products keep their category name."
            />
        </div>
    );
}
