"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not send code");

            toast.success(data.message || "Check your email for the code.");
            setStep(2);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!/^\d{4}$/.test(code)) {
            toast.error("Enter the 4-digit code from your email");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Reset failed");

            toast.success("Password updated! Sign in with your new password.");
            router.push("/auth/login");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-gray-100">
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-6"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </Link>

                <h1 className="text-3xl font-playfair font-bold mb-2">Forgot password</h1>
                <p className="text-gray-500 mb-8 text-sm">
                    {step === 1
                        ? "Enter your account email. We will send a 4-digit code."
                        : "Enter the code from your email and choose a new password."}
                </p>

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@email.com"
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3.5 font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 mt-4"
                        >
                            {loading ? "Sending…" : "Send 4-digit code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1">4-digit code</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d{4}"
                                maxLength={4}
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                placeholder="1234"
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black text-center text-2xl tracking-[0.5em] font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1">New password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-black"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-1">Confirm password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3.5 font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 mt-4"
                        >
                            {loading ? "Updating…" : "Reset password"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-gray-500 underline"
                        >
                            Resend code
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
