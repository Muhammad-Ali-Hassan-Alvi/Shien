"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Sparkles, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center h-14">
        
        <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-black' : 'text-gray-400'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Shop</span>
        </Link>

        <Link href="/categories" className={`flex flex-col items-center gap-1 ${isActive('/categories') ? 'text-black' : 'text-gray-400'}`}>
          <Grid size={22} strokeWidth={isActive('/categories') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Category</span>
        </Link>
        
        <Link href="/new" className={`flex flex-col items-center gap-1 ${isActive('/new') ? 'text-black' : 'text-gray-400'}`}>
          <Sparkles size={22} strokeWidth={isActive('/new') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">New</span>
        </Link>

        <Link href="/cart" className={`flex flex-col items-center gap-1 relative ${isActive('/cart') ? 'text-black' : 'text-gray-400'}`}>
           <div className="relative">
              <ShoppingCart size={22} strokeWidth={isActive('/cart') ? 2.5 : 2} />
              {mounted && items.length > 0 && (
                 <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center bg-red-600 text-white text-[8px] font-bold rounded-full">
                   {items.length}
                 </span>
              )}
           </div>
          <span className="text-[10px] font-medium">Cart</span>
        </Link>

        <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-black' : 'text-gray-400'}`}>
          <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Me</span>
        </Link>

      </div>
    </div>
  );
}
