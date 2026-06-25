
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSocket } from "@/context/SocketProvider";

const POLL_MS = 4000;

export default function AdminChatInterface({ ticket }) {
    const { socket, connected } = useSocket();
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState(ticket.messages || []);
    const messagesEndRef = useRef(null);
    const ticketId = ticket._id;

    useEffect(() => {
        setMessages(ticket.messages || []);
    }, [ticket.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const refreshMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/chat/conversations/${ticketId}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.conversation?.messages) {
                setMessages(data.conversation.messages);
            }
        } catch (e) {
            console.error("Failed to refresh chat", e);
        }
    }, [ticketId]);

    useEffect(() => {
        if (!socket) return;
        socket.emit("join:chat", ticketId);

        const onMessage = ({ ticketId: id, message: msg }) => {
            if (String(id) !== String(ticketId)) return;
            setMessages((prev) => {
                const exists = prev.some(
                    (m) =>
                        m.message === msg.message &&
                        m.sender === msg.sender &&
                        new Date(m.createdAt).getTime() ===
                            new Date(msg.createdAt).getTime()
                );
                if (exists) return prev;
                return [...prev, msg];
            });
        };

        socket.on("chat:message", onMessage);
        return () => {
            socket.emit("leave:chat", ticketId);
            socket.off("chat:message", onMessage);
        };
    }, [socket, ticketId]);

    useEffect(() => {
        if (connected) return;
        const interval = setInterval(refreshMessages, POLL_MS);
        return () => clearInterval(interval);
    }, [connected, refreshMessages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/chat/conversations/${ticketId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message.trim(), sender: "admin" }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to send");
                return;
            }
            setMessage("");
            setMessages((prev) => {
                const m = data.message;
                const exists = prev.some(
                    (x) =>
                        x.message === m.message &&
                        x.sender === m.sender &&
                        new Date(x.createdAt).getTime() ===
                            new Date(m.createdAt).getTime()
                );
                if (exists) return prev;
                return [...prev, m];
            });
        } catch {
            toast.error("Failed to send");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white border border-gray-200 border-t-0 rounded-b-xl overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {messages.map((msg, idx) => {
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
