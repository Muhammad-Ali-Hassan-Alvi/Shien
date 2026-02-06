"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/admin/Pagination";

const STATUS_OPTS = ["Pending", "Confirmed", "Dispatched", "Delivered", "Cancelled", "Returned"];
const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-blue-100 text-blue-800",
    Dispatched: "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
    Returned: "bg-gray-100 text-gray-800",
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const json = await res.json();
            if (json.orders) setOrders(json.orders);
        } catch (err) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        const promise = fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status: newStatus })
        });

        toast.promise(promise, {
            loading: 'Updating...',
            success: 'Status Updated!',
            error: 'Failed to update'
        });

        const res = await promise;
        if (res.ok) {
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    const paginatedOrders = orders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                <p className="text-gray-500 text-sm">Track and manage customer orders ({orders.length})</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-1">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order._id.slice(-6)}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold">{order.shippingInfo?.fullName}</div>
                                        <div className="text-xs text-gray-400">{order.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm max-w-xs truncate">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">Rs. {order.totalAmount}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer appearance-none ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}
                                        >
                                            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No orders found.</div>
                ) : (
                    <div className="px-4 pb-4">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={orders.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
