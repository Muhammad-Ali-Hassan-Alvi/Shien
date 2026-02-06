"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Mail, CheckCircle } from "lucide-react";
import Loader from "@/components/admin/Loader";

export default function HelpCenterPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/interactions?type=contact');
            const json = await res.json();
            if (json.data) setMessages(json.data);
        } catch (error) {
            toast.error("Failed to fetch messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const markAsRead = async (id) => {
        try {
            const res = await fetch('/api/admin/interactions?type=contact', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'Read' })
            });

            if (res.ok) {
                setMessages(prev => prev.map(m => m._id === id ? { ...m, status: 'Read' } : m));
                toast.success("Marked as Read");
            }
        } catch (error) {
            toast.error("Failed");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Help Center Messages</h1>

            <div className="space-y-4">
                {messages.map(msg => (
                    <div key={msg._id} className={`p-6 rounded-xl border shadow-sm transition-all ${msg.status === 'New' ? 'bg-white border-blue-200 ring-1 ring-blue-50' : 'bg-gray-50 border-gray-100 opacity-75'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${msg.status === 'New' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{msg.subject}</h3>
                                    <p className="text-xs text-gray-500">From: {msg.name} ({msg.email})</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>

                        <p className="text-sm text-gray-700 mb-4 pl-[52px]">
                            {msg.message}
                        </p>

                        {msg.status === 'New' && (
                            <div className="pl-[52px]">
                                <button
                                    onClick={() => markAsRead(msg._id)}
                                    className="flex items-center gap-2 text-sm font-bold text-black hover:underline"
                                >
                                    <CheckCircle size={16} /> Mark as Read
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {messages.length === 0 && <div className="text-center text-gray-400 p-12">No messages received.</div>}
            </div>
        </div>
    );
}
