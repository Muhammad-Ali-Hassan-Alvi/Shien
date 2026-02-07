"use client";

import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Search, User, Heart, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

const NAV_MENU = [
    { label: "Products", href: "/products" },
    { label: "New In", href: "/" },
    { 
      label: "Clothing", 
      href: "/",
      mega: true,
      subCategories: [
          {
              title: "Women's Fashion",
              items: ["Dresses", "Tops", "Blouses", "Jeans", "Skirts", "Pants", "Coats", "Sweaters"]
          },
          {
              title: "Men's Fashion",
              items: ["T-Shirts", "Shirts", "Pants", "Jeans", "Jackets", "Suits", "Activewear"]
          },
           {
              title: "Kids & Baby",
              items: ["Girls Clothing", "Boys Clothing", "Baby Wear", "Shoes", "Accessories"]
          }
      ]
    },
    { 
       label: "Shoes", 
       href: "/",
       mega: true,
        subCategories: [
          {
              title: "Women's Shoes",
              items: ["Sneakers", "Heels", "Boots", "Sandals", "Flats"]
          },
          {
               title: "Men's Shoes",
               items: ["Sneakers", "Formal", "Boots", "Loafers", "Running"]
          }
        ]
    },
    { label: "Sale", href: "/", highlight: true },
];

export default function Navbar() {
  const { openCart } = useUIStore();
  const { items } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
        <div className={`mx-auto max-w-7xl px-4 md:px-8 transition-all duration-500 rounded-full border border-white/40 shadow-sm hover:shadow-lg ${scrolled ? 'bg-white/70 backdrop-blur-xl w-[95%]' : 'bg-white/30 backdrop-blur-lg w-[98%]' } flex items-center justify-between`}>
           {/* Logo */}
     <Link href="/" className="px-4 py-2 text-2xl font-playfair font-black tracking-tighter bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
             iMART
           </Link>

           {/* Nav Links (Mega Menu) */}
           <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-700">
               {NAV_MENU.map((item) => (
                   <div key={item.label} className="relative group">
                       <Link href={item.href} className={`relative py-3 flex items-center gap-1 transition-colors ${item.highlight ? 'text-red-500 font-bold' : 'hover:text-indigo-600'}`}>
                           {item.label}
                           {item.mega && <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />}
                           
                           {!item.highlight && (
                               <span className="absolute inset-x-0 bottom-1 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-center ease-out duration-300"/>
                           )}
                       </Link>

                       {/* Mega Menu Dropdown */}
                       {item.mega && (
                           <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[600px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                               <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl p-6 grid grid-cols-3 gap-8 relative overflow-hidden">
                                   {/* Blob for aesthetic */}
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>

                                   {item.subCategories.map((sub, idx) => (
                                       <div key={idx} className="space-y-4">
                                           <h4 className="font-playfair font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">
                                               {sub.title}
                                           </h4>
                                           <ul className="space-y-2">
                                               {sub.items.map((subItem) => (
                                                   <li key={subItem}>
                                                       <Link href="/" className="text-gray-500 hover:text-indigo-600 block text-sm transition-colors hover:translate-x-1 duration-200">
                                                           {subItem}
                                                       </Link>
                                                   </li>
                                               ))}
                                           </ul>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}
                   </div>
               ))}
           </div>

           {/* Desktop Icons */}
           <div className="hidden md:flex items-center gap-2 pr-2">
                <button className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group">
                    <Search className="w-5 h-5 text-gray-700 group-hover:text-indigo-600" strokeWidth={2} />
                </button>
                <NotificationDropdown />
                <Link href="/wishlist" className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group">
                    <Heart className="w-5 h-5 text-gray-700 group-hover:text-pink-600" strokeWidth={2} />
                </Link>
                <button onClick={openCart} className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group relative">
                    <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-indigo-600" strokeWidth={2} />
                    {items.length > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg border border-white animate-pulse">
                            {items.length}
                        </span>
                    )}
                </button>
                 <Link href="/profile" className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group">
                    <User className="w-5 h-5 text-gray-700 group-hover:text-indigo-600" strokeWidth={2} />
                </Link>
           </div>

           {/* Mobile Actions */}
           <div className="flex md:hidden items-center gap-2 pl-2">
                <NotificationDropdown />
                <button onClick={openCart} className="p-2 relative">
                   <ShoppingBag className="w-6 h-6 text-gray-800" />
                   {items.length > 0 && (
                       <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center border border-white">
                           {items.length}
                       </span>
                   )}
                </button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                    {mobileMenuOpen ? <X size={24} className="text-gray-800" /> : <Menu size={24} className="text-gray-800" />}
                </button>
           </div>

           {/* Mobile Menu Overlay */}
           {mobileMenuOpen && (
               <div className="absolute top-full left-0 mt-4 w-[98%] mx-[1%] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-xl rounded-2xl p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5 z-40">
                   {/* Search Mobile */}
                   <div className="relative mb-2">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                       <input 
                           type="text" 
                           placeholder="Search..." 
                           className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-black"
                       />
                   </div>

                   {NAV_MENU.map(item => (
                       <Link 
                           key={item.label} 
                           href={item.href} 
                           className={`text-lg font-medium py-3 border-b border-gray-50 ${item.highlight ? 'text-red-500 font-bold' : 'text-gray-800'}`}
                           onClick={() => setMobileMenuOpen(false)}
                       >
                           {item.label}
                       </Link>
                   ))}
                   <Link href="/profile" className="flex items-center gap-3 py-3 border-b border-gray-50 text-gray-800" onClick={() => setMobileMenuOpen(false)}>
                       <User size={20} /> My Profile
                   </Link>
                   <Link href="/wishlist" className="flex items-center gap-3 py-3 text-gray-800" onClick={() => setMobileMenuOpen(false)}>
                       <Heart size={20} /> Wishlist
                   </Link>
               </div>
           )}
        </div>
    </nav>
  );
}
