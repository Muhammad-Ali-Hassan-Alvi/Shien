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
  
  // Calculate percentage off if not provided
  const percentOff = originalPrice > salePrice 
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) 
    : 0;

  return (
    <Link href={`/product/${product.slug}`} className="group relative block bg-white rounded-lg transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:z-10 bg-white">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-100 mb-2">
        {product.images?.[0] ? (
             <Image 
                src={product.images[0]} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
             />
        ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
        )}
        
        {/* Color Swatches Overlay (Bottom Right of Image) */}
        {product.images?.length > 1 && (
            <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-center">
                 {/* Show up to 3 dots + count */}
                 <div className="flex flex-col gap-1 items-center bg-black/5 p-1 rounded-full backdrop-blur-[1px]">
                     {product.images.slice(0, 3).map((img, i) => (
                         <div key={i} className="w-2.5 h-2.5 rounded-full border border-white relative overflow-hidden">
                             <Image src={img} fill className="object-cover" alt="color" />
                         </div>
                     ))}
                     {product.images.length > 3 && (
                         <span className="text-[8px] font-bold text-white shadow-sm drop-shadow-md">
                             +{product.variants?.length || 27}
                         </span>
                     )}
                 </div>
            </div>
        )}
      </div>

      <div className="px-2 pb-3">
        
        {/* Trends Tag */}
        <div className="flex gap-1 mb-1.5 flex-wrap">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-purple-100 text-[10px] text-purple-700 font-bold italic">
                <span className="mr-0.5">trends</span> 
                <span className="font-normal not-italic text-purple-600">#OldMoneyVibe</span>
            </span>
        </div>

        {/* Product Title with Inline Discount */}
        <div className="mb-2 min-h-[2.5em]">
            <h3 className="text-[13px] text-gray-800 leading-tight font-normal group-hover:text-black inline">
                {percentOff > 0 && (
                     <span className="inline-block border border-[#FA6338] text-[#FA6338] text-[10px] px-1 py-[1px] mr-1.5 leading-none rounded-[2px] align-middle">
                        -{percentOff}%
                     </span>
                )}
                <span className="align-middle">{product.name}</span>
            </h3>
        </div>

        {/* Bestseller Tag (Visible often or on hover/hot items) */}
        {percentOff > 20 && (
             <div className="mb-2">
                <span className="inline-block bg-[#FFF0E2] text-[#B07436] text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
                    #1 Bestseller <span className="font-normal text-[#B07436]/80 text-[9px] ml-1">in Blouses</span>
                </span>
             </div>
        )}
        
        {/* Price & Sold & Cart Action */}
        <div className="flex items-end justify-between mt-auto">
            <div>
                 <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-black">
                        Rs. {salePrice}
                    </span>
                    {originalPrice > salePrice && (
                         <span className="text-[10px] text-gray-400 line-through hidden md:inline">
                             Rs. {originalPrice}
                        </span>
                    )}
                </div>
                {/* Sold Count (Shows on hover or always for popular items) */}
                <div className="text-[10px] text-gray-500 mt-0.5">
                    100+ sold
                </div>
            </div>

            {/* Cart Button */}
            <button 
                onClick={handleAddToCart}
                className="px-3 py-2 flex items-center justify-center border border-black rounded-full hover:bg-black hover:text-white transition-colors group/cart bg-white" 
                title="Add to Cart"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 20 20" className="text-black group-hover/cart:text-white">
                    <path fill="currentColor" fillRule="evenodd" d="M2 3.25v1.5h2.14l1.2 9.3h11.703l.961-7.31h-1.513l-.764 5.81H6.66l-1.2-9.3z" clipRule="evenodd"></path>
                    <path fill="currentColor" fillRule="evenodd" d="M11.9 4.747h-1.5v1.99h-2v1.5h2v1.99h1.5v-1.99h2v-1.5h-2zM7.33 16.3a1 1 0 1 0-2 0 1 1 0 0 0 2 0M17.05 16.3a1 1 0 1 0-2 0 1 1 0 0 0 2 0" clipRule="evenodd"></path>
                </svg>
            </button>
        </div>

      </div>
    </Link>
  );
}
