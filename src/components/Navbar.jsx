"use client";

import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Search, User, Headset, ScanLine, Globe, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { openCart } = useUIStore();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 shadow-md">
      
      {/* Top Bar: Black Background */}
      <div className="bg-black text-white px-4 md:px-8 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8">
            
            {/* Logo */}
            <Link href="/" className="text-3xl font-bold tracking-widest shrink-0">
                SHEIN
            </Link>

            {/* Search Bar - Center */}
            <div className="hidden md:flex flex-1 max-w-2xl relative group">
                <input 
                    type="text" 
                    placeholder="Skirt" 
                    className="w-full h-10 pl-4 pr-12 text-sm text-black bg-white outline-none rounded-none focus:ring-0 placeholder:text-gray-400"
                />
                <button className="absolute right-0 top-0 h-10 w-12 bg-black flex items-center justify-center border-2 border-white group-hover:bg-[#333] transition-colors">
                    <Search color="white" size={20} />
                </button>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-6 shrink-0">
                <Link href="/profile" className="hover:text-gray-300">
                    <User size={24} strokeWidth={1.5} />
                </Link>
                <button onClick={openCart} className="relative hover:text-gray-300">
                    <ShoppingBag size={24} strokeWidth={1.5} />
                    <span className="absolute -top-1 -right-2 text-xs font-bold">{items.length}</span>
                </button>
                <div className="relative hover:text-gray-300 cursor-pointer">
                    <Link href="/wishlist">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5 4.5 2-1.5-1.5 2.74-2 4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        <span className="absolute -top-1 -right-2 text-xs font-bold">0</span>
                    </Link>
                </div>
                <button className="hover:text-gray-300">
                    <Headset size={24} strokeWidth={1.5} />
                </button>
                <button className="hover:text-gray-300">
                    <Globe size={24} strokeWidth={1.5} />
                </button>
            </div>
        </div>
      </div>

      {/* Bottom Bar: Navigation Links */}
      <div className="bg-black text-white border-t border-gray-800 hidden md:block">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8">
              <div className="flex items-center gap-8 h-10 text-xs font-medium overflow-x-auto no-scrollbar">
                  <div className="flex items-center cursor-pointer hover:bg-[#333] h-full px-2 -ml-2">
                      Categories <ChevronDown size={14} className="ml-1" />
                  </div>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Just for You</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">New In</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap text-yellow-400">Sale</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Women Clothing</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Beachwear</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Kids</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Curve</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Men Clothing</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Underwear & Sleepwear</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Shoes</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Home & Living</Link>
                  <Link href="/" className="hover:text-gray-300 whitespace-nowrap">Beauty & Health</Link>
              </div>
          </div>
      </div>

    </nav>
  );
}
