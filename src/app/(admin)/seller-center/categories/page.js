"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ChevronRight, ChevronDown, Plus, FolderPlus, Trash2, Tag, Edit } from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";
import Loader from "@/components/admin/Loader";
import CategoryUpdateModal from "@/components/admin/CategoryUpdateModal";

function CategoryTreeNode({
    node,
    depth,
    expanded,
    onToggle,
    onEdit,
    onDelete,
    onAddChild,
}) {
    const hasChildren = node.children?.length > 0;
    const isExpanded = expanded.has(node._id);

    return (
        <div>
            <div
                className="group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        {node.isLine && (
                            <span className="text-indigo-600 font-bold uppercase tracking-wide">Line</span>
                        )}
                        {!node.isActive && <span className="text-red-400">Inactive</span>}
                        {!node.showInNav && <span className="text-amber-500">Hidden from nav</span>}
                        {hasChildren && <span>{node.children.length} sub</span>}
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={() => onAddChild(node)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                        title="Add subcategory"
                    >
                        <FolderPlus size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(node)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(node._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div>
                    {node.children.map((child) => (
                        <CategoryTreeNode
                            key={child._id}
                            node={child}
                            depth={depth + 1}
                            expanded={expanded}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CategoriesPage() {
    const [categoryTree, setCategoryTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCat, setNewCat] = useState("");
    const [adding, setAdding] = useState(false);
    const [addingUnder, setAddingUnder] = useState(null); // { parentId, name }
    const [expanded, setExpanded] = useState(new Set());

    const [editModal, setEditModal] = useState(null);
    const [deleteState, setDeleteState] = useState({ isOpen: false, id: null, isDeleting: false });

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories?tree=true&admin=true");
            const json = await res.json();
            if (json.categories) setCategoryTree(json.categories);
        } catch {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

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
                toast.success("Updated!", { id: toastId });
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Lines → departments (left menu) → groups → items. Mark roots as Line for Woman/Man style tabs.
                    </p>
                </div>
            </div>

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

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {categoryTree.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        No categories yet. Add a top-level category to get started.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {categoryTree.map((node) => (
                            <CategoryTreeNode
                                key={node._id}
                                node={node}
                                depth={0}
                                expanded={expanded}
                                onToggle={toggleExpand}
                                onEdit={setEditModal}
                                onDelete={(id) => setDeleteState({ isOpen: true, id, isDeleting: false })}
                                onAddChild={(parent) => setAddingUnder({ parentId: parent._id, name: "" })}
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
