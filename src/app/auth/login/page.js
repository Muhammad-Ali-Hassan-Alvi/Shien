"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { authenticate } from "@/app/lib/actions";
import { safeCallbackPath } from "@/app/lib/siteUrl";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"), "/");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const result = await authenticate(null, formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Welcome back!");
                router.refresh();

                const target = result.role === "admin" ? "/seller-center" : callbackUrl;

                setTimeout(() => {
                    router.push(target);
                }, 500);
            }
        } catch {
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
                            placeholder="you@email.com or 03001234567"
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

                    <div className="flex justify-end">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-gray-500 hover:text-black underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3.5 font-bold rounded-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-lg"
                    >
                        {loading ? "Logging in..." : "Sign In"}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-gray-400">
                    Admin?{" "}
                    <Link href="/admin/login" className="font-bold text-gray-600 underline hover:text-black">
                        Sign in at Admin Portal
                    </Link>
                </p>
                <p className="mt-4 text-center text-sm text-gray-500">
                    New here? <Link href="/auth/register" className="font-bold text-black underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">Loading…</div>}>
            <LoginForm />
        </Suspense>
    );
}
