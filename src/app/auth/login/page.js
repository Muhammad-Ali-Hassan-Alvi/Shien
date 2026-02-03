"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authenticate } from "@/app/lib/actions";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const identifier = formData.get("identifier");
        const password = formData.get("password");

        try {
            const result = await authenticate(identifier, password);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Welcome back!");
                // Refresh to ensure middleware/server components see the new session
                router.refresh();

                if (result.role === 'admin') {
                    router.push('/seller-center');
                } else {
                    router.push('/');
                }
            }
        } catch (err) {
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-3xl font-playfair font-bold mb-6 text-center">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email or Phone</label>
                        <input
                            name="identifier"
                            type="text"
                            placeholder="admin@admin.com or 03001234567"
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
                        {loading ? "Logging in..." : "Sign In"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    New here? <Link href="/auth/register" className="font-bold text-black underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
}
