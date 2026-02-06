"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Star } from "lucide-react";
import Loader from "@/components/admin/Loader";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/interactions?type=reviews');
            const json = await res.json();
            if (json.data) setReviews(json.data);
        } catch (error) {
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id, status) => {
        const toastId = toast.loading("Updating...");
        try {
            const res = await fetch('/api/admin/interactions?type=reviews', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                setReviews(prev => prev.map(r => r._id === id ? { ...r, status } : r));
                toast.success("Updated!", { id: toastId });
            }
        } catch (error) {
            toast.error("Failed", { id: toastId });
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Rating</th>
                            <th className="px-6 py-4">Comment</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {reviews.map(r => (
                            <tr key={r._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 relative rounded bg-gray-100 overflow-hidden">
                                            {r.product?.images?.[0] && <Image src={r.product.images[0]} fill className="object-cover" alt="" />}
                                        </div>
                                        <span className="text-sm font-medium truncate max-w-[150px]">{r.product?.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">{r.user?.name || "User"}</td>
                                <td className="px-6 py-4">
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm max-w-xs truncate">{r.comment}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${r.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        r.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => updateStatus(r._id, 'Approved')} className="text-xs text-green-600 hover:underline font-bold">Approve</button>
                                    <button onClick={() => updateStatus(r._id, 'Rejected')} className="text-xs text-red-600 hover:underline font-bold">Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reviews.length === 0 && <div className="p-8 text-center text-gray-400">No reviews yet.</div>}
            </div>
        </div>
    );
}
