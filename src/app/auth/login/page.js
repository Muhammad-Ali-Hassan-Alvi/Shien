"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authenticate } from "@/app/lib/actions";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

                // CRITICAL: Refresh router to update middleware/session state
                router.refresh();

                // Small delay to ensure cookie propagation before redirect
                setTimeout(() => {
                    const target = result.role === 'admin' ? '/seller-center' : '/';
                    console.log(`Redirecting to: ${target} (Role: ${result.role})`);
                    router.push(target);
                }, 500);
            }
        } catch (err) {
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-playfair font-bold mb-2 text-center">Login</h1>
                <p className="text-center text-gray-500 mb-8 text-sm">Welcome back</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Email or Phone</label>
                        <input
                            name="identifier"
                            type="text"
                            placeholder="admin@admin.com or 03001234567"
                            required
                            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-black transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3.5 font-bold rounded-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-lg"
                    >
                        {loading ? "Logging in..." : "Sign In"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    New here? <Link href="/auth/register" className="font-bold text-black underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
}
