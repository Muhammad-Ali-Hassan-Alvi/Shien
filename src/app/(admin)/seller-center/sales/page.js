"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { TrendingUp, Tag, Calculator, History, Play, Pause, AlertTriangle, RefreshCcw } from "lucide-react";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import Pagination from "@/components/admin/Pagination";

export default function SalesPage() {
    const [categories, setCategories] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Modal State
    const [modal, setModal] = useState({ isOpen: false });
    const [loading, setLoading] = useState(false);

    // Smart Campaign State
    const [campaign, setCampaign] = useState({
        targetType: "category",
        targetValue: "",
        discountPercentage: 50,
        increasePercentage: 0,
        label: "FLAT 50% OFF"
    });

    const fetchData = () => {
        fetch('/api/categories').then(res => res.json()).then(data => {
            if (data.categories) setCategories(data.categories);
        });
        fetch('/api/admin/sales').then(res => res.json()).then(data => {
            if (data.sales) setSalesHistory(data.sales);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const confirmLaunch = (e) => {
        e.preventDefault();
        setModal({
            isOpen: true,
            title: "Launch Campaign?",
            message: `1. Increase Prices by ${campaign.increasePercentage}%\n2. Apply ${campaign.discountPercentage}% Discount\n\nTarget: ${campaign.targetValue === 'all' ? 'Everything' : campaign.targetValue}`,
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
        setLoading(true);
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
                    label: campaign.label
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
            setLoading(false);
        }
    };

    const performReset = async () => {
        setLoading(true);
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
            setLoading(false);
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

    // Simulator logic
    const simOriginal = 1000;
    const simInflated = Math.round(simOriginal * (1 + Number(campaign.increasePercentage) / 100));
    const simFinal = Math.round(simInflated * (1 - Number(campaign.discountPercentage) / 100));

    // Pagination Logic
    const paginatedHistory = salesHistory.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-12 max-w-6xl mx-auto pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales & Promotions</h1>
                <p className="text-gray-500">Manage pricing strategies and discount campaigns.</p>
            </div>

            {/* Campaign Builder */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-black text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Calculator className="text-yellow-400" />
                        <div>
                            <h2 className="text-xl font-bold">New Campaign</h2>
                            <p className="text-gray-400 text-xs text-opacity-80">Configure price hike & discount.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Target</label>
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

                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">1. Price Hike</h3>
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
                            <button onClick={confirmReset} className="px-6 py-4 rounded-xl font-bold text-lg bg-red-100 text-red-600 hover:bg-red-200 transition" title="Remove all discounts for selected target">
                                <RefreshCcw size={24} />
                            </button>
                        </div>
                    </form>

                    {/* Simulator */}
                    <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
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
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                    <History className="text-gray-400" />
                    <h2 className="text-xl font-bold">Campaign History</h2>
                </div>

                {/* Scrollable Table Wrapper */}
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-sm min-w-[800px]"> {/* min-w enforces scroll on small screens */}
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                            <tr>
                                <th className="px-4 py-3">Campaign</th>
                                <th className="px-4 py-3">Target</th>
                                <th className="px-4 py-3">Config</th>
                                <th className="px-4 py-3">Affected</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedHistory.map(sale => (
                                <tr key={sale._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{sale.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{sale.targetValue || sale.targetType}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col text-xs">
                                            <span className="text-blue-600">+{sale.increasePercentage}% Hike</span>
                                            <span className="text-red-600">-{sale.discountPercentage}% Off</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{sale.affectedProductCount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${sale.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-400 text-white'}`}>
                                            {sale.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => toggleSaleStatus(sale)}
                                            className="p-2 hover:bg-gray-200 rounded-full transition"
                                            title={sale.isActive ? "Pause Sale" : "Resume Sale"}
                                        >
                                            {sale.isActive ? <Pause size={16} /> : <Play size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={salesHistory.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>

            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
                isLoading={loading}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
            />
        </div>
    );
}
