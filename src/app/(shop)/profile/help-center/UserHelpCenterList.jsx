"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MessageSquare, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function UserHelpCenter() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch tickets via API (Client Component)
        // Since we are in client, we'll create a simple API route or fetch via server component passed as prop?
        // Let's assume we create an API route for fetching user tickets to keep it simple or use a server component wrapper.
        // For simplicity, let's make this page a Server Component that fetches data and passes to client list?
        // Wait, 'use client' is here. Let's make the parent page.js a server component.
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Help Center</h1>
                    <p className="text-gray-500 text-sm mt-1">Track your support requests</p>
                </div>
                <Link href="/profile/help-center/new" className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors">
                    <Plus size={16} /> New Request
                </Link>
            </div>

            {/* List */}
            {/* This part will be handled by the Server Component fetching data */}
        </div>
    );
}
