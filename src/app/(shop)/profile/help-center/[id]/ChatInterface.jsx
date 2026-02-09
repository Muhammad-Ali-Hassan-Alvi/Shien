
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, ShieldCheck } from "lucide-react"; // ShieldCheck for Admin
import { replyToTicket } from "@/app/lib/help-actions"; // Import server action or define locally if needed
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ChatInterface({ ticket, isAdmin = false }) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [ticket.messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        // Call server action? Wait, we need to import it. 
        // Need to ensure the action is imported correctly.
        // Assuming we update 'ChatInterface' to accept a `onReply` prop or import the action directly.
        // Let's import the action directly at top.

        const res = await replyToTicket(ticket._id, message, isAdmin ? 'admin' : 'user');

        if (res.error) {
            toast.error(res.error);
        } else {
            setMessage("");
            router.refresh(); // Refresh page to show new message
        }
        setSending(false);
    };

    return (
        <div className="flex-1 flex flex-col bg-white rounded-b-3xl border border-gray-100 shadow-sm overflow-hidden h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-gray-50/30">
                {ticket.messages.map((msg, idx) => {
                    const isMe = isAdmin ? msg.sender === 'admin' : msg.sender === 'user';

                    return (
                        <div key={idx} className={`flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {msg.sender === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                                </div>
                            )}

                            <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                                <div className={`px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${isMe
                                        ? 'bg-black text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {msg.message}
                                </div>
                                <span className="text-[10px] text-gray-400 px-1 font-bold">
                                    {msg.sender === 'admin' ? 'Support Agent' : 'You'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {isMe && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {msg.sender === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
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
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 font-medium text-gray-900 placeholder:text-gray-400 transition-all"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || sending}
                        className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
