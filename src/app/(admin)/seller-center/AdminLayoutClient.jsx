"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayoutClient({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <AdminSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />
            
            {/* Main Content Area */}
            {/* On Desktop (lg), Sidebar is static width 64 (16rem). We assume Sidebar component handles its width.
                However, if Sidebar is 'static' in flex, it pushes content.
                If Sidebar is 'fixed' on mobile, content takes full width.
                
                Code in AdminSidebar:
                lg:static (takes space in flex container)
                mobile: fixed (does NOT take space)
             */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
                
                <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden h-[calc(100vh-64px)] min-w-0 scrollbar-hide">
                    {children}
                </main>
            </div>
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}

/* Custom Scrollbar styles will be in globals.css or Tailwind plugin, mostly default is fine */
