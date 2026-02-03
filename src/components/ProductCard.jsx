"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ShoppingBag } from "lucide-react";
import AnimatedHeart from "./AnimatedHeart";

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

  const { salePrice, originalPrice, discountLabel } = product.pricing;

  return (
    <Link href={`/product/${product.slug}`} className="group block relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-2 rounded-sm border border-gray-100">
        {product.images?.[0] ? (
             <Image 
                src={product.images[0]} 
                alt={product.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
             />
        ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
        )}
        
        {/* Wishlist Heart - Now on Image */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            {isMounted && (
                <AnimatedHeart 
                    isActive={isInWishlist(product._id)}
                    onClick={() => toggleWishlist(product)}
                    className="p-1.5 bg-white/80 rounded-full hover:bg-white"
                />
            )}
        </div>
      </div>

      <div className="px-1">
        <h3 
            className="line-clamp-1 mb-1" 
            style={{
                fontFamily: '-apple-system, system-ui, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 400,
                color: 'rgb(0, 0, 0)',
                fontSize: '14px',
                lineHeight: '16px'
            }}
        >
            {product.name}
        </h3>
        
        <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
                <span 
                    style={{
                        fontFamily: '-apple-system, system-ui, "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 700,
                        color: 'rgb(249, 58, 0)',
                        fontSize: '20px',
                        lineHeight: '20px'
                    }}
                >
                    <span style={{ fontSize: "12px", marginRight: "2px" }}>RS</span>{salePrice}
                </span>
                {originalPrice > salePrice && (
                    <span className="text-xs text-gray-400 line-through">RS {originalPrice}</span>
                )}
            </div>
            
            {/* Add to Cart - Next to Price */}
            {/* Add to Cart - Next to Price */}
            <button 
                onClick={handleAddToCart}
                className="shrink-0 px-2 py-1 flex items-center justify-center border border-black rounded-full hover:bg-black hover:text-white transition-colors group/cart"
                title="Add to Cart"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" className="text-black group-hover/cart:text-white">
                    <path fill="currentColor" fillRule="evenodd" d="M2 3.25v1.5h2.14l1.2 9.3h11.703l.961-7.31h-1.513l-.764 5.81H6.66l-1.2-9.3z" clipRule="evenodd"/>
                    <path fill="currentColor" fillRule="evenodd" d="M11.9 4.747h-1.5v1.99h-2v1.5h2v1.99h1.5v-1.99h2v-1.5h-2zM7.33 16.3a1 1 0 1 0-2 0 1 1 0 0 0 2 0M17.05 16.3a1 1 0 1 0-2 0 1 1 0 0 0 2 0" clipRule="evenodd"/>
                </svg>
            </button>
        </div>
      </div>
    </Link>
  );
}
