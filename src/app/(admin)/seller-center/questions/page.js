"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MessageCircle, CheckCircle, Clock, Send } from "lucide-react";
import Loader from "@/components/admin/Loader";
import Image from "next/image";

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/admin/questions");
            const data = await res.json();
            if (data.questions) {
                setQuestions(data.questions);
            }
        } catch (error) {
            console.error("Error fetching admin questions:", error);
            toast.error("Failed to load");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return toast.error("Reply cannot be empty");

        setActionLoading(true);
        const toastId = toast.loading("Sending reply...");

        try {
            const res = await fetch("/api/admin/questions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, reply: replyText }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Reply sent & User Notified!", { id: toastId });
                setReplyingTo(null);
                setReplyText("");
                fetchQuestions();
            } else {
                toast.error(data.error || "Failed", { id: toastId });
            }
        } catch (error) {
            toast.error("Failed to reply", { id: toastId });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <Loader />;

    const pendingQuestions = questions.filter(q => !q.isReplied);
    const repliedQuestions = questions.filter(q => q.isReplied);

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <MessageCircle /> Customer Questions
                </h1>
                <p className="text-gray-500">Respond to questions from product pages.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-orange-600 font-bold uppercase text-xs">Pending Reply</p>
                        <h2 className="text-3xl font-bold text-orange-900">{pendingQuestions.length}</h2>
                    </div>
                </div>
                <div className="bg-green-50 border border-green-100 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-green-600 font-bold uppercase text-xs">Answered</p>
                        <h2 className="text-3xl font-bold text-green-900">{repliedQuestions.length}</h2>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q) => (
                    <div key={q._id} className={`bg-white rounded-xl border p-6 transition-all ${q.isReplied ? 'border-gray-100 opacity-75 hover:opacity-100' : 'border-orange-200 shadow-md'}`}>
                        <div className="flex flex-col md:flex-row gap-6">

                            {/* Product Info */}
                            <div className="w-full md:w-1/4 flex-shrink-0">
                                <div className="flex gap-3 items-center mb-2">
                                    <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                        {q.product?.images?.[0] && (
                                            <Image src={q.product.images[0]} fill className="object-cover" alt="Product" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{q.product?.name || "Unknown Product"}</h3>
                                        <span className="text-xs text-gray-500 mt-1 block">
                                            {new Date(q.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>Asked by: {q.user?.name || "User"}</span>
                                </div>
                            </div>

                            {/* Q&A Section */}
                            <div className="flex-1 space-y-4 border-l pl-0 md:pl-6 border-gray-100">
                                <div>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${q.isReplied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {q.isReplied ? 'Replied' : 'Pending Action'}
                                    </span>
                                    <p className="text-gray-800 font-medium text-lg">"{q.question}"</p>
                                </div>

                                {q.isReplied ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                                        <div className="absolute top-0 left-4 w-3 h-3 bg-gray-50 border-t border-l border-gray-100 transform rotate-45 -translate-y-1.5"></div>
                                        <p className="text-sm font-bold text-gray-900 mb-1">Response:</p>
                                        <p className="text-gray-600 text-sm">{q.reply}</p>
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        {replyingTo === q._id ? (
                                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-xs font-bold uppercase text-blue-600">Drafting Reply...</p>
                                                <textarea
                                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-sm"
                                                    rows="3"
                                                    placeholder={`Reply to ${q.user?.name || 'customer'}...`}
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                ></textarea>
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                                        className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-200 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleReply(q._id)}
                                                        disabled={actionLoading}
                                                        className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 flex items-center gap-2"
                                                    >
                                                        {actionLoading ? "Sending..." : <>Send Reply <Send size={14} /></>}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setReplyingTo(q._id); setReplyText(""); }}
                                                className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                                            >
                                                <MessageCircle size={14} /> Reply to this question
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <MessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-gray-400">No questions found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
