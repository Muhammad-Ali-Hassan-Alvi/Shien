"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Subscription failed");
            toast.success(data.message || "Subscribed!");
            setEmail("");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex group">
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="bg-transparent border-b border-gray-300 py-3 pr-4 w-full outline-none focus:border-black transition-colors placeholder:text-gray-400 group-hover:border-gray-400 disabled:opacity-60"
            />
            <button
                type="submit"
                disabled={loading}
                className="border-b border-gray-300 py-3 pl-4 hover:text-indigo-600 transition-colors group-hover:border-gray-400 disabled:opacity-60"
                aria-label="Subscribe"
            >
                <ArrowRight size={20} />
            </button>
        </form>
    );
}
