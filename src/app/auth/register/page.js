"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message);

            toast.success("Account Created! Please Login.");
            router.push("/auth/login");

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-3xl font-playfair font-bold mb-6 text-center">Join Shein.PK</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            name="name"
                            required
                            className="w-full border p-3 rounded mt-1 outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="03001234567"
                            required
                            className="w-full border p-3 rounded mt-1 outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full border p-3 rounded mt-1 outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 font-bold rounded hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link href="/auth/login" className="font-bold text-black underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
