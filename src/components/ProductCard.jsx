"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ShoppingBag, Heart } from "lucide-react";

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    const defaultVariant = product.variants?.[0] || { size: 'One Size', color: 'Default' };
    addItem(product, defaultVariant);
    openCart();
  };

  const handleWishlist = (e) => {
      e.preventDefault();
      toggleWishlist(product);
  };

  const { salePrice, originalPrice } = product.pricing;
  
  // Calculate percentage off
  const percentOff = originalPrice > salePrice 
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) 
    : 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div className="relative h-full bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-white/20 hover:border-white/50 group-hover:bg-white/80">
        
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
            {product.images?.[0] ? (
                <Image 
                    src={product.images[0]} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-100">
                    No Image
                </div>
            )}

            {/* Glass Glass Sale Tag */}
            {percentOff > 0 && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/30 backdrop-blur-md border border-white/40 rounded-full shadow-sm text-xs font-bold text-indigo-900 tracking-wide z-10">
                    -{percentOff}% OFF
                </div>
            )}

            {/* Floating Wishlist Button */}
            <button 
                onClick={handleWishlist}
                className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-red-500 transition-all duration-300 hover:scale-110 active:scale-95 z-10 group/heart"
            >
                <Heart size={18} className={isInWishlist(product._id) ? "fill-red-500 text-red-500" : "text-gray-700 group-hover/heart:text-red-500"} />
            </button>

            {/* Quick Add Button (Appears on Hover) */}
            <button 
                onClick={handleAddToCart}
                className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-xl rounded-full text-black shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
            >
                <ShoppingBag size={18} />
            </button>
        </div>

        {/* Content */}
        <div className="p-4">
            {/* Trends Tag */}
            <div className="flex gap-1 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                    Premium
                </span>
            </div>

            <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 truncate font-mulish group-hover:text-indigo-700 transition-colors">
                {product.name}
            </h3>

            <div className="flex items-baseline gap-2 mt-2">
                <span className="text-lg font-black font-playfair text-gray-900">
                    Rs. {salePrice.toLocaleString()}
                </span>
                {originalPrice > salePrice && (
                    <span className="text-xs text-gray-400 line-through decoration-gray-300">
                        Rs. {originalPrice.toLocaleString()}
                    </span>
                )}
            </div>
        </div>
      </div>
    </Link>
  );
}
