"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Tag } from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCat, setNewCat] = useState("");
    const [adding, setAdding] = useState(false);

    // Delete State
    const [deleteState, setDeleteState] = useState({ isOpen: false, id: null, isDeleting: false });

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const json = await res.json();
            if (json.categories) setCategories(json.categories);
        } catch (err) {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCat.trim()) return;

        setAdding(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCat })
            });

            const json = await res.json();

            if (res.ok) {
                setCategories(prev => [...prev, json.category].sort((a, b) => a.name.localeCompare(b.name)));
                setNewCat("");
                toast.success("Category added!");
            } else {
                toast.error(json.error || "Failed to add");
            }
        } catch (err) {
            toast.error("Error adding category");
        } finally {
            setAdding(false);
        }
    };

    const openDelete = (id) => {
        setDeleteState({ isOpen: true, id, isDeleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteState.id) return;
        setDeleteState(prev => ({ ...prev, isDeleting: true }));

        try {
            const res = await fetch(`/api/categories?id=${deleteState.id}`, { method: 'DELETE' });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c._id !== deleteState.id));
                toast.success("Deleted");
                setDeleteState({ isOpen: false, id: null, isDeleting: false });
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            toast.error("Failed to delete");
            setDeleteState(prev => ({ ...prev, isDeleting: false }));
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

            {/* Add New Input */}
            <form onSubmit={handleAdd} className="flex gap-4 max-w-md">
                <input
                    type="text"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    placeholder="New category name (e.g. Polos)"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
                <button
                    type="submit"
                    disabled={adding || !newCat.trim()}
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
                >
                    {adding ? "Adding..." : "Add"}
                </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.map(cat => (
                    <div key={cat._id} className="group relative bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <Tag size={20} />
                        </div>
                        <span className="font-bold text-gray-900 text-center">{cat.name}</span>

                        <button
                            onClick={() => openDelete(cat._id)}
                            className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {categories.length === 0 && <div className="text-gray-400 mt-8">No categories found. Start adding some!</div>}

            <DeleteModal
                isOpen={deleteState.isOpen}
                onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                isDeleting={deleteState.isDeleting}
                title="Delete Category"
                message="Are you sure? This doesn't remove products in this category, but unassigns them."
            />
        </div>
    );
}
