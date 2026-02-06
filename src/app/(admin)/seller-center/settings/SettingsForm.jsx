"use client";

import { useState } from "react";
import { Settings, Lock, Store, CreditCard, Loader2, Eye, EyeOff } from "lucide-react";
import { updateProfile, changePassword } from "@/app/lib/actions";
import { toast } from "react-hot-toast";


// Reusable Password Input Component
function PasswordInput({ name, placeholder }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input 
                name={name} 
                type={show ? "text" : "password"} 
                placeholder={placeholder} 
                required
                className="w-full border p-2.5 rounded text-sm pr-10 outline-none focus:ring-1 focus:ring-black" 
            />
            <button 
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}

export default function SettingsForm({ user }) {
    const [loading, setLoading] = useState(false);
    
    // Password Change State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passLoading, setPassLoading] = useState(false);

    // Profile Form Handler
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        
        const res = await updateProfile(formData);
        
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Profile updated successfully");
        }
        setLoading(false);
    };

    // Password Form Handler
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassLoading(true);
        const formData = new FormData(e.currentTarget);
        const currentParams = formData.get("currentPassword");
        const newParams = formData.get("newPassword");
        const confirmParams = formData.get("confirmPassword");

        if (newParams !== confirmParams) {
            toast.error("New passwords do not match");
            setPassLoading(false);
            return;
        }

        const res = await changePassword(currentParams, newParams);
        if (res?.error) {
           toast.error(res.error);
        } else {
           toast.success("Password changed successfully");
           setIsPasswordModalOpen(false);
           e.target.reset();
        }
        setPassLoading(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold font-playfair">Store Settings</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* General Config (Profile) */}
                <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-gray-100 h-fit">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-50 rounded-lg"><Store size={20} /></div>
                        <h3 className="font-bold">General</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Store name, logo, and contact info.</p>
                    <div className="space-y-3">
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase">Store/User Name</label>
                           <input 
                                name="name" 
                                placeholder="Store Name" 
                                className="w-full border p-2 rounded text-sm mt-1" 
                                defaultValue={user?.name || ""} 
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                           <input 
                                name="email" 
                                placeholder="Support Email" 
                                className="w-full border p-2 rounded text-sm mt-1" 
                                defaultValue={user?.email || ""} 
                           />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-black text-white py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>

                {/* Security */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 h-fit">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-50 rounded-lg"><Lock size={20} /></div>
                        <h3 className="font-bold">Security</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Password and access controls.</p>
                    

                    {!isPasswordModalOpen ? (
                        <button 
                            onClick={() => setIsPasswordModalOpen(true)}
                            type="button"
                            className="w-full border border-gray-200 text-gray-700 font-bold text-xs uppercase py-2.5 rounded hover:bg-gray-50"
                        >
                            Change Password
                        </button>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-3 animate-in fade-in slide-in-from-top-2">
                             <PasswordInput name="currentPassword" placeholder="Current Password" />
                             <PasswordInput name="newPassword" placeholder="New Password" />
                             <PasswordInput name="confirmPassword" placeholder="Confirm New Password" />
                             
                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded text-xs font-bold uppercase hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={passLoading}
                                    className="flex-1 bg-red-600 text-white py-2 rounded text-xs font-bold uppercase hover:bg-red-700 flex justify-center items-center gap-1"
                                >
                                    {passLoading && <Loader2 size={14} className="animate-spin" />}
                                    Update
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Payments */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 h-fit">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-50 rounded-lg"><CreditCard size={20} /></div>
                        <h3 className="font-bold">Payments</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Manage payment methods and payouts.</p>
                    
                    <div className="space-y-4">
                        {/* Stripe */}
                        <div className="border border-gray-100 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-sm text-gray-700">Stripe (International)</span>
                                {user?.stripeId && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active</span>}
                            </div>
                            {user?.stripeId ? (
                                <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 p-2 rounded">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Connected
                                </div>
                            ) : (
                                <button className="w-full bg-[#635BFF] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#5349e0] transition">
                                Connect Stripe
                                </button>
                            )}
                        </div>

                        {/* GoPayFast */}
                        <div className="border border-gray-100 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-sm text-gray-700">GoPayFast (Pakistan)</span>
                                {user?.gopayfastId && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active</span>}
                            </div>
                            {user?.gopayfastId ? (
                                <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 p-2 rounded">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Connected
                                </div>
                            ) : (
                                <button className="w-full bg-[#F37021] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#e06010] transition">
                                Connect GoPayFast
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


