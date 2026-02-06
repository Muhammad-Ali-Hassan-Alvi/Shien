"use client";

import { useActionState, useState } from "react";
import { authenticate } from "@/app/lib/actions";
import { useEffect } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminLoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [errorMessage]);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
            {/* Animated Mesh Background (Reusing global styles if available, or inline) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/40 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-200/40 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 transform transition-all hover:scale-[1.01]">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-playfair font-black text-gray-900 mb-2">Admin Portal</h1>
                        <p className="text-gray-500 text-sm font-medium">SHEIN PREMIUM MANAGEMENT</p>
                    </div>

                    <form action={dispatch} className="space-y-6">
                        {/* Hidden flag for Admin Login */}
                        <input type="hidden" name="isAdminLogin" value="true" />

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@shein.pk"
                                    required
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <LoginButton />
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/auth/login" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            Wait, I am a customer
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-900 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                </>
            ) : "Access Dashboard"}
        </button>
    );
}
