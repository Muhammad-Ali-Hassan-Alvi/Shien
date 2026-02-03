"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import clsx from "clsx";

const STATUSES = ["Pending", "Confirmed", "Dispatched", "Delivered", "Cancelled", "Returned"];

export default function OrderStatusSelect({ orderId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!res.ok) throw new Error("Failed to update");
        
        toast.success("Status Updated");
    } catch (err) {
        toast.error("Error Updating Status");
        setStatus(initialStatus); // Revert
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="relative">
        <select 
            value={status} 
            onChange={handleChange}
            disabled={loading}
            className={clsx(
                "py-1 px-3 rounded-full text-xs font-bold border outline-none cursor-pointer appearance-none pr-8",
                status === "Pending" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                status === "Confirmed" && "bg-blue-100 text-blue-800 border-blue-200",
                status === "Dispatched" && "bg-purple-100 text-purple-800 border-purple-200",
                status === "Delivered" && "bg-green-100 text-green-800 border-green-200",
                (status === "Cancelled" || status === "Returned") && "bg-red-100 text-red-800 border-red-200"
            )}
        >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {loading && <div className="absolute right-2 top-1.5 w-3 h-3 border-2 border-black border-dashed rounded-full animate-spin"></div>}
    </div>
  );
}
