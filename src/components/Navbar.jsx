"use client";

import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Search, User, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { openCart } = useUIStore();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
        if (window.scrollY > 10) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic classes
  const navClasses = isScrolled 
    ? "bg-black text-white shadow-md border-transparent" 
    : "bg-white/95 backdrop-blur-md border-transparent text-black shadow-sm";

  const iconClasses = isScrolled 
    ? "text-white hover:bg-white/20" 
    : "text-gray-600 hover:text-black hover:bg-gray-100";

  return (
    <nav className={`sticky top-0 z-50 bg-[#F7F5F2] border-b border-gray-100 transition-all duration-300 ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
             <button className={`md:hidden p-2 -ml-2 ${iconClasses}`}>
                <Menu size={24} />
             </button>
             <Link href="/" className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-mulish)' }}>
                SHEIN<span className="text-red-600">.PK</span>
             </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8" style={{ fontFamily: 'var(--font-mulish)' }}>
             <Link href="/" className="text-sm font-bold hover:text-red-600 transition-colors">Women</Link>
             <Link href="/" className="text-sm font-bold hover:text-red-600 transition-colors">Men</Link>
             <Link href="/" className="text-sm font-bold hover:text-red-600 transition-colors">Kids</Link>
             <Link href="/" className="text-sm font-bold hover:text-red-600 transition-colors text-red-600">Sale</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-full transition-colors ${iconClasses}`}>
               <Search size={22} />
            </button>
            <Link href="/profile" className={`p-2 rounded-full transition-colors hidden sm:block ${iconClasses}`}>
               <User size={22} />
            </Link>
            
            <button 
                onClick={openCart}
                className={`relative p-2 rounded-full transition-colors ${iconClasses}`}
            >
               <ShoppingBag size={22} />
               {mounted && items.length > 0 && (
                 <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                   {items.length}
                 </span>
               )}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
