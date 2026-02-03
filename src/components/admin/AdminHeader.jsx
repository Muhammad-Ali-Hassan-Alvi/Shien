"use client";

import { Bell, Search, User, Menu } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search orders, products, customers..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none outline-none rounded-lg text-sm focus:ring-1 focus:ring-black/5"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-black transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900 leading-none">Admin User</p>
            <p className="text-xs text-gray-500 mt-1">Super Admin</p>
          </div>
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
