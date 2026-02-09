
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, ShieldCheck } from "lucide-react";
import { replyToTicket, updateTicketStatus } from "@/app/lib/help-actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminChatInterface({ ticket, mode = 'full' }) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (mode === 'full') scrollToBottom();
    }, [ticket.messages, mode]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        const res = await replyToTicket(ticket._id, message, 'admin');

        if (res.error) {
            toast.error(res.error);
        } else {
            setMessage("");
            router.refresh();
        }
        setSending(false);
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        const res = await updateTicketStatus(ticket._id, newStatus);
        if (res.error) {
            toast.error("Failed to update status");
        } else {
            toast.success("Status Updated");
            router.refresh();
        }
    };

    if (mode === 'status-only') {
        return (
            <select
                value={ticket.status}
                onChange={handleStatusChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5"
            >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
            </select>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white border border-gray-200 border-t-0 rounded-b-xl overflow-hidden h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {ticket.messages.map((msg, idx) => {
                    const isMe = msg.sender === 'admin';

                    return (
                        <div key={idx} className={`flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-200 text-gray-500`}>
                                    <User size={14} />
                                </div>
                            )}

                            <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                                <div className={`px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${isMe
                                        ? 'bg-black text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {msg.message}
                                </div>
                                <span className="text-[10px] text-gray-400 px-1 font-bold">
                                    {msg.sender === 'admin' ? 'You' : 'Customer'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {isMe && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-black text-white`}>
                                    <ShieldCheck size={14} />
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Reply to customer..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 font-medium text-gray-900 placeholder:text-gray-400 transition-all text-sm"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || sending}
                        className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
