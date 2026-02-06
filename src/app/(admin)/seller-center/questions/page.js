"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { MessageSquare, Send } from "lucide-react";
import Loader from "@/components/admin/Loader";

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [replyText, setReplyText] = useState({}); // Keyed by ID
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/interactions?type=questions');
            const json = await res.json();
            if (json.data) setQuestions(json.data);
        } catch (error) {
            toast.error("Failed to fetch questions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReply = async (id) => {
        const text = replyText[id];
        if (!text) return toast.error("Write a reply first");

        const toastId = toast.loading("Sending reply...");
        try {
            const res = await fetch('/api/admin/interactions?type=questions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, reply: text })
            });

            if (res.ok) {
                toast.success("Replied & Notified User!", { id: toastId });
                setQuestions(prev => prev.map(q => q._id === id ? { ...q, isReplied: true, reply: text } : q));
            }
        } catch (error) {
            toast.error("Failed", { id: toastId });
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Q&A Management</h1>

            <div className="space-y-4">
                {questions.map(q => (
                    <div key={q._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-20 bg-gray-100 rounded-lg relative flex-shrink-0 overflow-hidden">
                            {q.product?.images?.[0] ? (
                                <Image src={q.product.images[0]} fill className="object-cover" alt="" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300"><MessageSquare size={20} /></div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{q.product?.name || "Unknown Product"}</h3>
                                    <p className="text-xs text-gray-500">Asked by {q.user?.name || "User"} • {new Date(q.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${q.isReplied ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                    {q.isReplied ? "Replied" : "Pending"}
                                </span>
                            </div>

                            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                                <span className="font-bold text-xs text-gray-400 block mb-1">Question:</span>
                                {q.question}
                            </p>

                            {q.isReplied ? (
                                <p className="text-sm text-gray-600 pl-4 border-l-2 border-green-500">
                                    <span className="font-bold text-xs text-green-600 block mb-1">Your Reply:</span>
                                    {q.reply}
                                </p>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type your reply here..."
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-black outline-none"
                                        value={replyText[q._id] || ""}
                                        onChange={(e) => setReplyText(prev => ({ ...prev, [q._id]: e.target.value }))}
                                    />
                                    <button
                                        onClick={() => handleReply(q._id)}
                                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition flex items-center gap-2"
                                    >
                                        <Send size={14} /> Send
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {questions.length === 0 && <div className="text-center text-gray-400 p-12">No questions yet.</div>}
            </div>
        </div>
    );
}
