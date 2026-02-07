"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Send, User as UserIcon, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProductQA({ product }) {
    const { data: session } = useSession();
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, [product._id]);

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`/api/questions?productId=${product._id}`);
            const data = await res.json();
            if (data.questions) {
                setQuestions(data.questions);
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        if (!session) {
            toast.error("Please login to ask a question");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product._id,
                    userId: session.user.id || session.user._id, // Adapt based on session shape
                    question: newQuestion
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Question submitted!");
                setNewQuestion("");
                fetchQuestions(); // Refresh list to see own question (even if unapproved/unreplied)
            } else {
                toast.error(data.error || "Failed to submit");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-16 scroll-mt-24" id="qna">
            <h2 className="text-2xl font-playfair font-bold mb-6 flex items-center gap-2">
                Questions & Answers <span className="text-gray-400 text-lg font-normal">({questions.length})</span>
            </h2>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Questions List */}
                <div className="flex-1 space-y-6">
                    {fetching ? (
                        <p className="text-gray-500">Loading Q&A...</p>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                            <MessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500">No questions yet. Be the first to ask!</p>
                        </div>
                    ) : (
                        questions.map((q) => (
                            <div key={q._id} id={`qna-${q._id}`} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                {/* Question */}
                                <div className="flex gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {q.user?.image ? (
                                            <Image src={q.user.image} width={32} height={32} alt="User" />
                                        ) : (
                                            <UserIcon size={16} className="text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-1">
                                            {q.user?.name || "User"} 
                                            <span className="text-xs font-normal text-gray-400 ml-2">
                                                {new Date(q.createdAt).toLocaleDateString()}
                                            </span>
                                        </p>
                                        <p className="text-gray-700">{q.question}</p>
                                    </div>
                                </div>

                                {/* Answer */}
                                {q.isReplied && (
                                    <div className="ml-11 bg-white p-4 rounded-lg border border-gray-100 relative">
                                        <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                                        <p className="text-sm font-bold text-black mb-1">Admin Response</p>
                                        <p className="text-gray-600 text-sm">{q.reply}</p>
                                        <p className="text-xs text-gray-400 mt-2 text-right">
                                            {new Date(q.repliedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Ask Question Form */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white border p-6 rounded-xl shadow-sm sticky top-24">
                        <h3 className="font-bold text-lg mb-4">Ask a Question</h3>
                        {session ? (
                            <form onSubmit={handleAskQuestion}>
                                <textarea
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none min-h-[100px] text-sm mb-3"
                                    placeholder="Type your question here..."
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    maxLength={300}
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{newQuestion.length}/300</span>
                                    <button 
                                        type="submit" 
                                        disabled={loading || !newQuestion.trim()}
                                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? "Sending..." : <>Post Question <Send size={14} /></>}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-500 mb-4 text-sm">Please login to ask questions about this product.</p>
                                <Link href="/auth/login" className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800 inline-block">
                                    Login to Ask
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
