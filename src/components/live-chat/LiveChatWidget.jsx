"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
    ChevronDown,
    Home,
    MessageCircle,
    Send,
    User,
    ShieldCheck,
    ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSocket } from "@/context/SocketProvider";
import {
    chatApiHeaders,
    getStoredGuestProfile,
    saveGuestProfile,
} from "@/lib/liveChatSession";
import { getSupportPhone } from "@/app/lib/support";

const POLL_MS = 4000;

function formatTime(date) {
    return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatListTime(date) {
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
        return formatTime(d);
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function LiveChatWidget() {
    const { data: session } = useSession();
    const { socket, connected } = useSocket();
    const supportPhone = getSupportPhone();

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("home");
    const [view, setView] = useState("home");
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [sending, setSending] = useState(false);
    const [draft, setDraft] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);
    const isLoggedIn = Boolean(session?.user?.id);

    useEffect(() => {
        const stored = getStoredGuestProfile();
        setGuestName(stored.name);
        setGuestEmail(stored.email);
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const fetchConversations = useCallback(async () => {
        setLoadingList(true);
        try {
            const res = await fetch("/api/chat/conversations", {
                headers: chatApiHeaders(),
            });
            const data = await res.json();
            if (res.ok && data.conversations) {
                setConversations(data.conversations);
            }
        } catch (e) {
            console.error("Failed to load conversations", e);
        } finally {
            setLoadingList(false);
        }
    }, []);

    const fetchConversation = useCallback(async (id) => {
        setLoadingChat(true);
        try {
            const res = await fetch(`/api/chat/conversations/${id}`, {
                headers: chatApiHeaders(),
            });
            const data = await res.json();
            if (res.ok && data.conversation) {
                setMessages(data.conversation.messages || []);
            }
        } catch (e) {
            console.error("Failed to load conversation", e);
        } finally {
            setLoadingChat(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchConversations();
        }
    }, [open, fetchConversations]);

    useEffect(() => {
        if (!activeId) return;
        fetchConversation(activeId);
        socket?.emit("join:chat", activeId);
        return () => socket?.emit("leave:chat", activeId);
    }, [activeId, fetchConversation, socket]);

    useEffect(() => {
        if (!socket) return;

        const onMessage = ({ ticketId, message }) => {
            if (String(ticketId) !== String(activeId)) {
                if (message?.sender === "admin" && !open) {
                    setUnread((n) => n + 1);
                }
                fetchConversations();
                return;
            }

            setMessages((prev) => {
                const exists = prev.some(
                    (m) =>
                        m.message === message.message &&
                        m.sender === message.sender &&
                        new Date(m.createdAt).getTime() ===
                            new Date(message.createdAt).getTime()
                );
                if (exists) return prev;
                return [...prev, message];
            });
            fetchConversations();
        };

        socket.on("chat:message", onMessage);
        return () => socket.off("chat:message", onMessage);
    }, [socket, activeId, open, fetchConversations]);

    useEffect(() => {
        if (!activeId || !open || view !== "chat") return;
        if (connected) return;

        const interval = setInterval(() => {
            fetchConversation(activeId);
        }, POLL_MS);

        return () => clearInterval(interval);
    }, [activeId, open, view, connected, fetchConversation]);

    const openChat = (id) => {
        setActiveId(id);
        setView("chat");
        setTab("messages");
        setUnread(0);
    };

    const startNewConversation = () => {
        if (isLoggedIn) {
            setActiveId(null);
            setMessages([]);
            setView("compose");
            setTab("messages");
            return;
        }
        setView("guest-form");
        setTab("messages");
    };

    const handleStartChat = async (e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text) return;

        if (!isLoggedIn) {
            const name = guestName.trim();
            const email = guestEmail.trim().toLowerCase();
            if (!name || !email) {
                toast.error("Please enter your name and email");
                return;
            }
            saveGuestProfile(name, email);
        }

        setSending(true);
        try {
            const res = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: chatApiHeaders(),
                body: JSON.stringify({
                    message: text,
                    guestName: guestName.trim(),
                    guestEmail: guestEmail.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Could not start chat");
                return;
            }
            setDraft("");
            const id = data.conversation._id;
            setMessages(data.conversation.messages || []);
            setActiveId(id);
            setView("chat");
            fetchConversations();
        } catch {
            toast.error("Could not start chat");
        } finally {
            setSending(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || !activeId) return;

        setSending(true);
        try {
            const res = await fetch(`/api/chat/conversations/${activeId}/messages`, {
                method: "POST",
                headers: chatApiHeaders(),
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to send");
                return;
            }
            setDraft("");
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
            fetchConversations();
        } catch {
            toast.error("Failed to send");
        } finally {
            setSending(false);
        }
    };

    const toggleOpen = () => {
        setOpen((v) => {
            if (!v) setUnread(0);
            return !v;
        });
    };

    const activeConversation = conversations.find((c) => c._id === activeId);

    return (
        <div className="fixed bottom-[4.75rem] right-4 md:bottom-6 md:right-6 z-[150] flex flex-col items-end gap-3">
            {open && (
                <div
                    className="w-[min(100vw-2rem,380px)] h-[min(72vh,560px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
                    role="dialog"
                    aria-label="Live chat"
                >
                    {view === "home" && tab === "home" && (
                        <div className="flex-1 flex flex-col bg-gradient-to-b from-neutral-900 to-neutral-800 text-white">
                            <div className="p-5 pb-4">
                                <div className="flex items-center justify-center gap-2 mb-5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs font-semibold text-white/90">
                                        Online
                                    </span>
                                </div>
                                <div className="flex justify-center mb-4">
                                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-neutral-900 font-black text-lg shadow-lg">
                                        IM
                                    </div>
                                </div>
                                <p className="text-center text-sm text-white/80 leading-relaxed px-2">
                                    Need help? Start a conversation to ask your queries!
                                </p>
                            </div>

                            <div className="px-4 pb-4 flex-1">
                                <button
                                    type="button"
                                    onClick={startNewConversation}
                                    className="w-full bg-white text-neutral-900 rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg hover:shadow-xl transition-shadow text-left group"
                                >
                                    <div>
                                        <p className="font-bold text-sm">New Conversation</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            We typically reply in a few minutes
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <Send size={16} />
                                    </div>
                                </button>

                                {supportPhone && (
                                    <p className="text-center text-[11px] text-white/50 mt-4">
                                        Or call us at {supportPhone}
                                    </p>
                                )}
                            </div>

                            <nav className="flex border-t border-white/10 bg-white text-neutral-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTab("home");
                                        setView("home");
                                    }}
                                    className="flex-1 py-3 flex flex-col items-center gap-0.5 text-neutral-900"
                                >
                                    <Home size={20} />
                                    <span className="text-[10px] font-bold">Home</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTab("messages");
                                        setView(
                                            conversations.length ? "list" : "home"
                                        );
                                        if (conversations.length) setView("list");
                                        else setView("home");
                                    }}
                                    className="flex-1 py-3 flex flex-col items-center gap-0.5 text-gray-400"
                                >
                                    <MessageCircle size={20} />
                                    <span className="text-[10px] font-bold">Messages</span>
                                </button>
                            </nav>
                        </div>
                    )}

                    {(tab === "messages" || view !== "home") && view !== "home" && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="bg-neutral-900 text-white px-4 py-3 flex items-center gap-2 shrink-0">
                                {view !== "list" && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (view === "chat" || view === "compose" || view === "guest-form") {
                                                setView("list");
                                                setActiveId(null);
                                            }
                                        }}
                                        className="p-1 hover:bg-white/10 rounded-lg"
                                        aria-label="Back"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">
                                        {view === "list"
                                            ? "Messages"
                                            : view === "guest-form"
                                              ? "Start a chat"
                                              : view === "compose"
                                                ? "New Conversation"
                                                : activeConversation?.subject || "Chat"}
                                    </p>
                                    {view === "chat" && (
                                        <p className="text-[10px] text-white/60 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            Support team
                                        </p>
                                    )}
                                </div>
                            </div>

                            {view === "list" && (
                                <div className="flex-1 overflow-y-auto bg-gray-50">
                                    {loadingList ? (
                                        <p className="text-center text-sm text-gray-400 py-8">
                                            Loading...
                                        </p>
                                    ) : conversations.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <p className="text-sm text-gray-500 mb-4">
                                                No conversations yet
                                            </p>
                                            <button
                                                type="button"
                                                onClick={startNewConversation}
                                                className="text-sm font-bold text-neutral-900 underline"
                                            >
                                                Start one now
                                            </button>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-100">
                                            {conversations.map((c) => (
                                                <li key={c._id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => openChat(c._id)}
                                                        className="w-full text-left px-4 py-3 hover:bg-white transition-colors"
                                                    >
                                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                                            {c.subject}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                                            {c.lastMessage?.message || "No messages"}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            {formatListTime(c.updatedAt)}
                                                        </p>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="p-3 border-t border-gray-100 bg-white">
                                        <button
                                            type="button"
                                            onClick={startNewConversation}
                                            className="w-full py-2.5 bg-neutral-900 text-white text-sm font-bold rounded-xl hover:bg-neutral-800"
                                        >
                                            New Conversation
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === "guest-form" && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const name = guestName.trim();
                                        const email = guestEmail.trim();
                                        if (!name || !email) {
                                            toast.error("Name and email are required");
                                            return;
                                        }
                                        saveGuestProfile(name, email);
                                        setView("compose");
                                    }}
                                    className="flex-1 flex flex-col p-4 gap-3 bg-gray-50 overflow-y-auto"
                                >
                                    <p className="text-sm text-gray-600">
                                        Enter your details so our team can reach you.
                                    </p>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                        required
                                    />
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        placeholder="Your email"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="mt-auto py-3 bg-neutral-900 text-white font-bold rounded-xl text-sm"
                                    >
                                        Continue
                                    </button>
                                </form>
                            )}

                            {(view === "compose" || view === "chat") && (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/80 min-h-0">
                                        {loadingChat && messages.length === 0 ? (
                                            <p className="text-center text-sm text-gray-400 py-8">
                                                Loading...
                                            </p>
                                        ) : (
                                            messages.map((msg, idx) => {
                                                const isUser = msg.sender === "user";
                                                return (
                                                    <div
                                                        key={`${idx}-${msg.createdAt}`}
                                                        className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                                                    >
                                                        {!isUser && (
                                                            <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                                                                <ShieldCheck size={12} />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}
                                                        >
                                                            <div
                                                                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                                    isUser
                                                                        ? "bg-neutral-900 text-white rounded-tr-sm"
                                                                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                                                                }`}
                                                            >
                                                                {msg.message}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                                {isUser ? "You" : "Support"} ·{" "}
                                                                {formatTime(msg.createdAt)}
                                                            </span>
                                                        </div>
                                                        {isUser && (
                                                            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                                                                <User size={12} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <form
                                        onSubmit={
                                            view === "compose"
                                                ? handleStartChat
                                                : handleSendReply
                                        }
                                        className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0"
                                    >
                                        <input
                                            type="text"
                                            value={draft}
                                            onChange={(e) => setDraft(e.target.value)}
                                            placeholder={
                                                view === "compose"
                                                    ? "Type your question..."
                                                    : "Type a message..."
                                            }
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neutral-900 min-w-0"
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!draft.trim() || sending}
                                            className="p-2.5 bg-neutral-900 text-white rounded-xl disabled:opacity-40 shrink-0"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </>
                            )}

                            <nav className="flex border-t border-gray-100 bg-white shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTab("home");
                                        setView("home");
                                        setActiveId(null);
                                    }}
                                    className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-gray-400"
                                >
                                    <Home size={18} />
                                    <span className="text-[10px] font-bold">Home</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTab("messages");
                                        setView(conversations.length ? "list" : "list");
                                        fetchConversations();
                                    }}
                                    className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-neutral-900"
                                >
                                    <MessageCircle size={18} />
                                    <span className="text-[10px] font-bold">Messages</span>
                                </button>
                            </nav>
                        </div>
                    )}

                    {tab === "messages" && view === "home" && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="bg-neutral-900 text-white px-4 py-3">
                                <p className="font-bold text-sm">Messages</p>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-gray-50">
                                {conversations.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <p className="text-sm text-gray-500 mb-4">
                                            No messages yet
                                        </p>
                                        <button
                                            type="button"
                                            onClick={startNewConversation}
                                            className="py-2.5 px-4 bg-neutral-900 text-white text-sm font-bold rounded-xl"
                                        >
                                            New Conversation
                                        </button>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {conversations.map((c) => (
                                            <li key={c._id}>
                                                <button
                                                    type="button"
                                                    onClick={() => openChat(c._id)}
                                                    className="w-full text-left px-4 py-3 hover:bg-white"
                                                >
                                                    <p className="font-semibold text-sm truncate">
                                                        {c.subject}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {c.lastMessage?.message}
                                                    </p>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <nav className="flex border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTab("home");
                                        setView("home");
                                    }}
                                    className="flex-1 py-2.5 flex flex-col items-center text-gray-400"
                                >
                                    <Home size={18} />
                                    <span className="text-[10px] font-bold">Home</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 py-2.5 flex flex-col items-center text-neutral-900"
                                >
                                    <MessageCircle size={18} />
                                    <span className="text-[10px] font-bold">Messages</span>
                                </button>
                            </nav>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={toggleOpen}
                        className="absolute -bottom-12 right-0 w-12 h-12 rounded-full bg-neutral-900 text-white shadow-xl flex items-center justify-center hover:bg-neutral-800 md:hidden"
                        aria-label="Minimize chat"
                    >
                        <ChevronDown size={22} />
                    </button>
                </div>
            )}

            <button
                type="button"
                onClick={toggleOpen}
                className="relative w-14 h-14 rounded-full bg-neutral-900 text-white shadow-2xl flex items-center justify-center hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all"
                aria-label={open ? "Close chat" : "Open live chat"}
            >
                {open ? (
                    <ChevronDown size={24} />
                ) : (
                    <MessageCircle size={24} />
                )}
                {!open && unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <p className="hidden md:block text-[11px] text-gray-500 font-medium bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow border border-gray-100">
                    Islamabad Mart Support
                </p>
            )}
        </div>
    );
}
