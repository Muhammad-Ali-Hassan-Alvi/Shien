"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import StyledSelect from "@/components/ui/StyledSelect";

const STATUSES = ["Pending", "Confirmed", "Dispatched", "Delivered", "Cancelled", "Returned"];

export default function OrderStatusSelect({ orderId, initialStatus, onUpdated }) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setLoading(true);

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update");

            toast.success(`Order → ${newStatus}`);
            onUpdated?.(newStatus);
        } catch {
            toast.error("Error updating status");
            setStatus(initialStatus);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledSelect
            value={status}
            onChange={handleChange}
            options={STATUSES}
            variant="order"
            disabled={loading}
            className="min-w-[140px]"
            aria-label="Order status"
        />
    );
}
