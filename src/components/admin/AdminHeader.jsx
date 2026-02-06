"use client";

import { useState } from "react";
import { Bell, Search, User, Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminHeader({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
      { id: 1, type: 'order', message: "New Order #1024 placed by Sarah J.", time: "2 min ago", read: false },
      { id: 2, type: 'user', message: "New customer registered: Ali Khan", time: "15 min ago", read: false },
      { id: 3, type: 'stock', message: "Low Stock Alert: 'Summer Dress' (Only 2 left)", time: "1 hour ago", read: true },
      { id: 4, type: 'system', message: "System backup completed successfully", time: "5 hours ago", read: true },
  ]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      
      {/* Mobile Menu Toggle */}
      <button 
          onClick={onMenuClick}
          className="lg:hidden mr-4 text-gray-500 hover:text-black focus:outline-none"
      >
          <Menu size={24} />
      </button>

      {/* Search - Visible on larger screens, Icon only on mobile? Or flexible */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full max-w-[200px] md:max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none outline-none rounded-lg text-sm focus:ring-1 focus:ring-black/5"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-500 hover:text-black transition-colors outline-none"
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm">Notifications</h3>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">{notifications.filter(n => !n.read).length} New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                      <div>
                        <p className="text-sm text-gray-800 leading-tight mb-1">{notif.message}</p>
                        <p className="text-xs text-gray-400">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <button className="text-xs font-bold text-gray-500 hover:text-black">View All</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative group">
            <button className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-100 outline-none">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-none">Admin User</p>
                <p className="text-xs text-gray-500 mt-1">Super Admin</p>
              </div>
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white">
                <User size={18} />
              </div>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 transform origin-top-right z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                    <Link href="/seller-center/settings" className="text-sm font-bold block w-full hover:text-blue-600">
                        My Account
                    </Link>
                </div>
                <button 
                    onClick={() => signOut({ callbackUrl: '/auth/login' })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
      </div>
    </header>
  );
}
