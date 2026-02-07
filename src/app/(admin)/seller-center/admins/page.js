"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ShieldCheck, Mail, Phone, User as UserIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "@/components/admin/Loader";

export default function AdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetch("/api/admin/admins");
            const data = await res.json();
            if (data.admins) setAdmins(data.admins);
        } catch (error) {
            console.error("Failed to fetch admins");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this admin?")) return;
        try {
            const res = await fetch(`/api/admin/admins?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                toast.success("Admin removed");
                setAdmins(admins.filter(a => a._id !== id));
            } else {
                toast.error(data.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting admin");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("New Admin Created!");
                setAdmins([data.admin, ...admins]);
                setShowModal(false);
                setFormData({ name: "", email: "", phone: "", password: "" });
            } else {
                toast.error(data.error || "Failed to create admin");
            }
        } catch (error) {
            toast.error("Error creating admin");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admins</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage platform administrators</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 font-medium"
                >
                    <Plus size={18} />
                    Add New Admin
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.map((admin) => (
                        <div key={admin._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(admin._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete Admin"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{admin.name}</h3>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">ADMIN</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-gray-400" />
                                    <span>{admin.email || "No Email"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400" />
                                    <span>{admin.phone || "No Phone"}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {admins.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            No admins found. Add one to manage the platform.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Add New Admin</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    className="w-full border p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="03001234567"
                                    className="w-full border p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full border p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-black"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
                                >
                                    {submitting ? "Creating..." : "Create Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
