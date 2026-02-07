"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { TrendingUp, Tag, Calculator, History, Play, Pause, AlertTriangle, RefreshCcw, Edit, Calendar } from "lucide-react";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import Pagination from "@/components/admin/Pagination";
import Loader from "@/components/admin/Loader";

export default function SalesPage() {
    const [categories, setCategories] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Loading States
    const [initialLoading, setInitialLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal State
    const [modal, setModal] = useState({ isOpen: false });
    const [editModal, setEditModal] = useState(null); // Sale object to edit

    // Filter State
    const [filterCategory, setFilterCategory] = useState("All");

    // Smart Campaign State
    const [campaign, setCampaign] = useState({
        targetType: "category",
        targetValue: "",
        discountPercentage: 50,
        increasePercentage: 0,
        label: "FLAT 50% OFF",
        description: "",
        startDate: "",
        endDate: ""
    });

    const fetchData = async () => {
        try {
            const [catRes, salesRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/admin/sales')
            ]);

            const catData = await catRes.json();
            const salesData = await salesRes.json();

            if (catData.categories) setCategories(catData.categories);
            if (salesData.sales) setSalesHistory(salesData.sales);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const confirmLaunch = (e) => {
        e.preventDefault();
        setModal({
            isOpen: true,
            title: "Launch Campaign?",
            message: `1. Increase Prices by ${campaign.increasePercentage}%\n2. Apply ${campaign.discountPercentage}% Discount\nTarget: ${campaign.targetValue === 'all' ? 'Everything' : campaign.targetValue}\n\nThis will modify product prices immediately.`,
            onConfirm: performSmartSale,
            confirmText: "Launch Campaign"
        });
    };

    const confirmReset = (e) => {
        e.preventDefault();
        if (!campaign.targetValue) {
            toast.error("Please select a target to reset.");
            return;
        }
        setModal({
            isOpen: true,
            title: "Reset Prices / Remove Discounts?",
            message: `This will REMOVE all discounts for: ${campaign.targetValue === 'all' ? 'Everything' : campaign.targetValue}.\n\nSale Price will be reset to match Original Price.\nInflation (Hike) will NOT be reversed automatically.`,
            onConfirm: performReset,
            confirmText: "Reset Prices"
        });
    };

    const performSmartSale = async () => {
        setActionLoading(true);
        const toastId = toast.loading("Launching...");
        try {
            const res = await fetch('/api/admin/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'apply_smart_sale',
                    targetType: campaign.targetType,
                    targetValue: campaign.targetValue,
                    percentage: campaign.discountPercentage,
                    increasePercentage: campaign.increasePercentage,
                    label: campaign.label,
                    description: campaign.description,
                    startDate: campaign.startDate,
                    endDate: campaign.endDate
                })
            });
            const json = await res.json();
            if (res.ok) {
                toast.success("Campaign Launched!", { id: toastId });
                setModal({ isOpen: false });
                fetchData(); // Refresh history
            }
            else throw new Error(json.error);
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setActionLoading(false);
        }
    };

    const performReset = async () => {
        setActionLoading(true);
        const toastId = toast.loading("Resetting Prices...");
        try {
            const res = await fetch('/api/admin/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reset_prices',
                    targetType: campaign.targetType,
                    targetValue: campaign.targetValue
                })
            });
            const json = await res.json();
            if (res.ok) {
                toast.success("Prices Reset Successfully", { id: toastId });
                setModal({ isOpen: false });
                fetchData();
            } else {
                throw new Error(json.error);
            }
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setActionLoading(false);
        }
    };

    const toggleSaleStatus = async (sale) => {
        const newStatus = !sale.isActive;
        const toastId = toast.loading(newStatus ? "Resuming Sale..." : "Pausing Sale...");
        try {
            const res = await fetch('/api/admin/sales', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sale._id, isActive: newStatus })
            });
            if (res.ok) {
                toast.success(newStatus ? "Sale Resumed" : "Sale Paused", { id: toastId });
                fetchData();
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            toast.error("Error updating sale", { id: toastId });
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editModal) return;

        setActionLoading(true);
        const toastId = toast.loading("Updating Sale...");
        try {
            const res = await fetch('/api/admin/sales', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editModal._id,
                    targetValue: editModal.targetValue,
                    discountPercentage: editModal.discountPercentage,
                    label: editModal.label,
                    description: editModal.description,
                    startDate: editModal.startDate,
                    endDate: editModal.endDate
                })
            });
            const json = await res.json();
            if (res.ok) {
                toast.success("Sale Updated!", { id: toastId });
                setEditModal(null);
                fetchData();
            } else {
                throw new Error(json.error || "Failed");
            }
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setActionLoading(false);
        }
    };

    // Simulator logic
    const simOriginal = 1000;
    const simInflated = Math.round(simOriginal * (1 + Number(campaign.increasePercentage) / 100));
    const simFinal = Math.round(simInflated * (1 - Number(campaign.discountPercentage) / 100));

    // Filter Logic
    const filteredHistory = salesHistory.filter(sale => {
        if (filterCategory === "All") return true;
        return sale.targetValue === filterCategory;
    });

    // Pagination Logic
    const paginatedHistory = filteredHistory.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (initialLoading) return <Loader />;

    return (
        <div className="space-y-12 max-w-6xl mx-auto pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales & Promotions</h1>
                <p className="text-gray-500">Manage pricing strategies and discount campaigns.</p>
            </div>

            {/* Campaign Builder */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-black text-white p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Calculator className="text-yellow-400" />
                        <h2 className="text-xl font-bold">New Campaign</h2>
                    </div>
                    <p className="text-gray-400 text-xs text-opacity-80">Configure price hike & discount.</p>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold mb-2">Target Category</label>
                                <select
                                    className="w-full border p-3 rounded bg-gray-50 font-medium"
                                    value={campaign.targetValue}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCampaign({
                                            ...campaign,
                                            targetValue: val,
                                            targetType: val === 'all' ? 'all' : 'category'
                                        });
                                    }}
                                    required
                                >
                                    <option value="">Select Target...</option>
                                    <option value="all">Whole Website (All Products)</option>
                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Start Date</label>
                                <input
                                    type="date" // Using date for simplicity, could be datetime-local
                                    className="w-full border p-3 rounded"
                                    value={campaign.startDate}
                                    onChange={(e) => setCampaign({ ...campaign, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">End Date (Active To)</label>
                                <input
                                    type="date"
                                    className="w-full border p-3 rounded"
                                    value={campaign.endDate}
                                    onChange={(e) => setCampaign({ ...campaign, endDate: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold mb-2">Description / Note</label>
                                <input
                                    type="text"
                                    className="w-full border p-3 rounded"
                                    placeholder="e.g. Summer Clearance Sale"
                                    value={campaign.description}
                                    onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
                                />
                            </div>
                        </div>


                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">1. Price Hike (Inflation)</h3>
                            <label className="block text-xs font-bold uppercase text-blue-600 mb-1">Increase By (%)</label>
                            <input
                                type="number"
                                className="w-full border p-3 rounded text-lg"
                                value={campaign.increasePercentage}
                                onChange={(e) => setCampaign({ ...campaign, increasePercentage: e.target.value })}
                                min="0"
                            />
                        </div>

                        <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                            <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">2. Discount</h3>
                            <label className="block text-xs font-bold uppercase text-red-600 mb-1">Discount (%)</label>
                            <input
                                type="number"
                                className="w-full border p-3 rounded text-lg mb-3"
                                value={campaign.discountPercentage}
                                onChange={(e) => setCampaign({
                                    ...campaign,
                                    discountPercentage: e.target.value,
                                    label: `FLAT ${e.target.value}% OFF`
                                })}
                                min="0" max="100"
                            />
                            <input
                                type="text"
                                className="w-full border p-2 rounded text-sm"
                                value={campaign.label}
                                onChange={(e) => setCampaign({ ...campaign, label: e.target.value })}
                                placeholder="Label (e.g. FLAT 50% OFF)"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button onClick={confirmLaunch} className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg shadow-black/20">
                                Launch Campaign
                            </button>
                            <button onClick={confirmReset} className="px-6 py-4 rounded-xl font-bold text-lg bg-red-100 text-red-600 hover:bg-red-200 transition" title="Remove all discounts">
                                <RefreshCcw size={24} />
                            </button>
                        </div>
                    </form>

                    {/* Simulator */}
                    <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 h-fit">
                        <h3 className="font-bold text-gray-900 mb-6">Simulator (Base: 1000)</h3>
                        <div className="space-y-6 relative text-sm">
                            <div className="flex justify-between items-center opacity-70">
                                <span>Original</span>
                                <span className="font-mono">Rs. {simOriginal}</span>
                            </div>
                            <div className="flex justify-between items-center text-blue-700 font-bold">
                                <span>After {campaign.increasePercentage}% Hike</span>
                                <span className="font-mono">Rs. {simInflated}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center text-red-600 text-xl font-bold">
                                <span>Selling Price</span>
                                <span className="font-mono">Rs. {simFinal}</span>
                            </div>
                        </div>
                        <div className="mt-8 text-xs text-gray-500">
                            <p><strong>Note:</strong> Multiple overlapping sales may cause cumulative effects. Use "Reset Prices" to clear current discounts before applying new ones if needed.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <History className="text-gray-400" />
                        <h2 className="text-xl font-bold">Campaign History</h2>
                    </div>

                    {/* Category Filter */}
                    <select
                        className="border p-2 rounded text-sm min-w-[200px]"
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                {/* Scrollable Table Wrapper */}
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-sm min-w-[900px]">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                            <tr>
                                <th className="px-4 py-3">Campaign</th>
                                <th className="px-4 py-3">Target</th>
                                <th className="px-4 py-3">Discount</th>
                                <th className="px-4 py-3">Active To</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedHistory.map(sale => (
                                <tr key={sale._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{sale.name}</p>
                                        {sale.description && <p className="text-xs text-gray-400">{sale.description}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{sale.targetValue || sale.targetType}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col text-xs">
                                            {sale.increasePercentage > 0 && <span className="text-blue-600">+{sale.increasePercentage}% Hike</span>}
                                            <span className="text-red-600 font-bold">-{sale.discountPercentage}% Off</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {sale.endDate ? new Date(sale.endDate).toLocaleDateString() : 'Until Stopped'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${sale.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {sale.isActive ? 'Active' : 'Paused'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditModal(sale)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition"
                                                title="Edit Sale"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleSaleStatus(sale)}
                                                className={`p-2 rounded-lg transition ${sale.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={sale.isActive ? "Pause Sale" : "Resume Sale"}
                                            >
                                                {sale.isActive ? <Pause size={16} /> : <Play size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredHistory.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>

            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
                isLoading={actionLoading}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
            />

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-black text-white flex-none">
                            <h2 className="text-xl font-bold">Edit Campaign</h2>
                            <button onClick={() => setEditModal(null)} className="hover:text-gray-300"><Calendar size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSave} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold mb-1">Campaign Name</label>
                                <input disabled value={editModal.name} className="w-full border p-2 rounded bg-gray-100 text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Target</label>
                                <select
                                    className="w-full border p-2 rounded bg-white font-medium"
                                    value={editModal.targetValue}
                                    onChange={(e) => setEditModal({ ...editModal, targetValue: e.target.value })}
                                >
                                    <option value="all">Whole Website (All Products)</option>
                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    value={editModal.discountPercentage}
                                    onChange={e => setEditModal({ ...editModal, discountPercentage: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    min="0" max="100"
                                />
                                <p className="text-xs text-red-500 mt-1">Changing this will update prices of all affected products immediately!</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Label</label>
                                <input
                                    type="text"
                                    value={editModal.label}
                                    onChange={e => setEditModal({ ...editModal, label: e.target.value })}
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={editModal.startDate ? new Date(editModal.startDate).toISOString().split('T')[0] : ''}
                                        onChange={e => setEditModal({ ...editModal, startDate: e.target.value })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={editModal.endDate ? new Date(editModal.endDate).toISOString().split('T')[0] : ''}
                                        onChange={e => setEditModal({ ...editModal, endDate: e.target.value })}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    value={editModal.description || ''}
                                    onChange={e => setEditModal({ ...editModal, description: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    rows="2"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={actionLoading} className="flex-1 bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800">
                                    {actionLoading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
