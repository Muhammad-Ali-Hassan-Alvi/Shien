"use client";

import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const { isCartOpen, closeCart } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // Hydration fix for persist middleware
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div 
        className={clsx(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-playfair font-bold">Shopping Bag ({items.length})</h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Free Shipping Progress (Shein style) */}
        <div className="bg-black text-white text-xs py-2 text-center uppercase tracking-wide">
             Free Shipping on orders over Rs. 5000
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {items.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <ShoppingBag size={48} />
                <p>Your bag is empty</p>
                <button onClick={closeCart} className="text-black underline">Continue Shopping</button>
             </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item._id}-${idx}`} className="flex gap-4">
                 {/* Image Placeholder if no image */}
                 <div className="relative w-24 h-32 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {item.images?.[0] ? (
                        <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200" />
                    )}
                 </div>

                 <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                             <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                             <button onClick={() => removeItem(item._id, item.variant)} className="text-gray-400 hover:text-red-500">
                                <X size={16} />
                             </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {item.variant.color} / {item.variant.size}
                        </p>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex items-center border border-gray-300 rounded-full h-8 px-2 space-x-2">
                             <button onClick={() => updateQuantity(item._id, item.variant, item.quantity - 1)} disabled={item.quantity <= 1}>
                                <Minus size={14} />
                             </button>
                             <span className="text-sm w-4 text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item._id, item.variant, item.quantity + 1)}>
                                <Plus size={14} />
                             </button>
                        </div>
                        <div className="flex flex-col items-end">
                           {item.pricing?.originalPrice > item.pricing?.salePrice && (
                               <span className="text-xs text-gray-400 line-through">Rs. {item.pricing.originalPrice}</span>
                           )}
                           <span className="font-bold">Rs. {item.pricing?.salePrice || item.salePrice}</span>
                        </div>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
            <div className="p-4 border-t border-gray-100 space-y-4 pb-8">
                <div className="flex justify-between text-lg font-bold">
                    <span>Subtotal</span>
                    <span>Rs. {getCartTotal()}</span>
                </div>
                <p className="text-xs text-gray-500 text-center">Shipping & taxes calculated at checkout.</p>
                <Link 
                  href="/checkout" 
                  onClick={closeCart}
                  className="block w-full bg-black text-white text-center py-4 font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors"
                >
                    Checkout Now
                </Link>
            </div>
        )}
      </div>
    </>
  );
}
