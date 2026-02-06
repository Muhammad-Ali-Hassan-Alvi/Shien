"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle, Truck, User, Settings, LogOut, Key, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { updateProfile, changePassword } from "@/app/lib/actions";
import { toast } from "react-hot-toast";

// Helper for status colors
const getStatusColor = (status) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Confirmed': return 'bg-blue-100 text-blue-800';
        case 'Dispatched': return 'bg-purple-100 text-purple-800';
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function ProfileDashboard({ user, orders }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [orderFilter, setOrderFilter] = useState("ALL");
    
    // Stats
    const pendingCount = orders.filter(o => ['Pending', 'Confirmed', 'Processing'].includes(o.status)).length;
    const receivedCount = orders.filter(o => o.status === 'Delivered').length;
    const totalSpent = orders.reduce((acc, o) => acc + o.totalAmount, 0);

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        if (orderFilter === 'ALL') return true;
        if (orderFilter === 'PENDING') return ['Pending', 'Confirmed', 'Dispatched'].includes(order.status);
        if (orderFilter === 'RECEIVED') return order.status === 'Delivered';
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                                {user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <h2 className="font-bold text-lg">{user.name}</h2>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>

                        <nav className="space-y-2">
                            <button 
                                onClick={() => setActiveTab("overview")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                <User size={18} /> Overview
                            </button>
                            <button 
                                onClick={() => setActiveTab("orders")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                <Package size={18} /> My Orders
                            </button>
                            <button 
                                onClick={() => setActiveTab("settings")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                <Settings size={18} /> Settings
                            </button>
                            <button 
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-8"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 bg-gradient-to-r from-gray-900 to-black text-white">
                                <h1 className="text-3xl font-playfair font-bold mb-2">Hello, {user.name}</h1>
                                <p className="text-gray-400">Here's what's happening with your account today.</p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Orders</p>
                                        <p className="text-3xl font-bold">{orders.length}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-full"><Package size={24} /></div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-600 text-xs font-bold uppercase tracking-wider mb-1">Pending/Active</p>
                                        <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-3 text-yellow-600 rounded-full"><Clock size={24} /></div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Received/Done</p>
                                        <p className="text-3xl font-bold text-green-600">{receivedCount}</p>
                                    </div>
                                    <div className="bg-green-50 p-3 text-green-600 rounded-full"><CheckCircle size={24} /></div>
                                </div>
                             </div>

                             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                 <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                     <h3 className="font-bold text-lg">Recent Activity</h3>
                                     <button onClick={() => setActiveTab('orders')} className="text-sm underline">View All</button>
                                 </div>
                                 <div className="divide-y divide-gray-100">
                                     {orders.slice(0, 3).map(order => (
                                         <div key={order._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                             <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                     <Package size={20} className="text-gray-600"/>
                                                 </div>
                                                 <div>
                                                     <p className="font-bold text-sm">Order #{order._id.toString().slice(-6)}</p>
                                                     <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                 </div>
                                             </div>
                                             <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                 {order.status}
                                             </div>
                                         </div>
                                     ))}
                                     {orders.length === 0 && <p className="p-6 text-gray-500 text-center">No recent activity.</p>}
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="flex justify-between items-center">
                                 <h2 className="text-2xl font-bold font-playfair">My Orders ({orders.length})</h2>
                                 <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                                     {['ALL', 'PENDING', 'RECEIVED'].map(filter => (
                                         <button 
                                            key={filter}
                                            onClick={() => setOrderFilter(filter)}
                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${orderFilter === filter ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                         >
                                             {filter}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             <div className="space-y-4">
                                {filteredOrders.length === 0 ? (
                                    <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-medium">No orders found in this category.</p>
                                    </div>
                                ) : (
                                    filteredOrders.map(order => (
                                        <div key={order._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-gray-50">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-lg">Order #{order._id.toString().slice(-8)}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${getStatusColor(order.status)}`}>{order.status}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                                <div className="text-right mt-2 md:mt-0">
                                                    <p className="text-2xl font-bold font-playfair">Rs. {order.totalAmount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">{order.items.length} items</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-black rounded-full"></div>
                                                            <span className="text-gray-700">{item.name || "Product"}</span>
                                                            <span className="text-xs text-gray-400 bg-gray-50 px-1.5 rounded">x{item.quantity}</span>
                                                        </div>
                                                        <span className="font-medium text-gray-900">Rs. {item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                             </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold font-playfair mb-6">Account Settings</h2>
                            <UserSettingsForm user={user} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function UserSettingsForm({ user }) {
    const [loading, setLoading] = useState(false);
    
    // Profile Update
    async function handleProfile(e) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await updateProfile(formData);
        if (res?.error) toast.error(res.error);
        else toast.success("Profile updated!");
        setLoading(false);
    }

    // Password Update
    async function handlePass(e) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await changePassword(formData.get("current"), formData.get("new"));
        if (res?.error) toast.error(res.error);
        else {
            toast.success("Password changed!");
            e.target.reset();
        }
        setLoading(false);
    }

    return (
        <div className="space-y-8 max-w-lg">
            <form onSubmit={handleProfile}>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20} /> Personal Info</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
                        <input name="name" defaultValue={user.name} className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-1 focus:ring-black" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Email</label>
                        <input name="email" defaultValue={user.email} className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-1 focus:ring-black" required />
                    </div>
                    <button disabled={loading} className="px-6 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50">
                        {loading ? "Saving..." : "Update Profile"}
                    </button>
                </div>
            </form>

            <div className="border-t border-gray-100 my-6"></div>

            <form onSubmit={handlePass}>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Key size={20} /> Security</h3>
                <div className="space-y-4">
                    <div>
                         <label className="text-xs font-bold uppercase text-gray-500">Current Password</label>
                         <input name="current" type="password" className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-1 focus:ring-black" required />
                    </div>
                    <div>
                         <label className="text-xs font-bold uppercase text-gray-500">New Password</label>
                         <input name="new" type="password" className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-1 focus:ring-black" required />
                    </div>
                    <button disabled={loading} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition disabled:opacity-50">
                         {loading ? "Updating..." : "Change Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}
