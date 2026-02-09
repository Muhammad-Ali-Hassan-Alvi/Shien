
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { updateProfile, changePassword } from "@/app/lib/actions"; // Server Actions
import { User, Lock, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { data: session, update } = useSession();

    // Profile State
    const [name, setName] = useState(session?.user?.name || "");
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);

        const formData = new FormData();
        formData.append("name", name);
        // Email update might require verification, let's stick to Name for now or read from input if enabled
        // formData.append("email", email); 

        const res = await updateProfile(formData);

        if (res.success) {
            toast.success("Profile updated!");
            await update(); // Update session
        } else {
            toast.error(res.error || "Update failed");
        }
        setLoadingProfile(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoadingPassword(true);
        const res = await changePassword(currentPassword, newPassword);

        if (res.success) {
            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            toast.error(res.error || "Change failed");
        }
        setLoadingPassword(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold font-playfair mb-6">Account Settings</h1>

            {/* Profile Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User size={20} /> Personal Information
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={session?.user?.email || ""}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                    </div>
                    <button
                        disabled={loadingProfile}
                        className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loadingProfile && <Loader2 size={14} className="animate-spin" />}
                        Save Changes
                    </button>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Lock size={20} /> Change Password
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none"
                            />
                        </div>
                    </div>
                    <button
                        disabled={loadingPassword}
                        className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loadingPassword && <Loader2 size={14} className="animate-spin" />}
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
}
