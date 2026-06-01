"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import StyledSelect from "@/components/ui/StyledSelect";
import { TICKET_STATUS_OPTIONS } from "@/app/lib/statusStyles";
import { updateTicketStatus } from "@/app/lib/help-actions";

export default function TicketStatusSelect({ ticketId, initialStatus }) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setLoading(true);

        const res = await updateTicketStatus(ticketId, newStatus);
        if (res.error) {
            toast.error("Failed to update status");
            setStatus(initialStatus);
        } else {
            toast.success(`Status → ${newStatus}`);
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <StyledSelect
            value={status}
            onChange={handleChange}
            options={TICKET_STATUS_OPTIONS}
            variant="ticket-status"
            disabled={loading}
            aria-label="Ticket status"
        />
    );
}
