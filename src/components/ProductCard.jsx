"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ShoppingBag, Heart } from "lucide-react";
import { isProductInStock } from "@/app/lib/productStock";
import StockBadge from "@/components/ui/StockBadge";
import ShareProductButton from "@/components/ShareProductButton";

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { salePrice, originalPrice, discountLabel } = product.pricing;

  const percentOff =
    originalPrice > salePrice
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0;
  const badgeText =
    percentOff > 0
      ? discountLabel || `-${percentOff}% OFF`
      : discountLabel && !/^0\s*%/i.test(String(discountLabel))
        ? discountLabel
        : null;
  const inStock = isProductInStock(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!inStock) return;
    const defaultVariant = product.variants?.[0] || { size: "One Size", color: "Default" };
    addItem(product, defaultVariant);
    openCart();
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div className="relative h-full bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-white/20 hover:border-white/50 group-hover:bg-white/80">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-700 group-hover:scale-110 ${!inStock ? "opacity-60 grayscale-[30%]" : ""}`}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-100">
              No Image
            </div>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-white/20 z-[1] pointer-events-none" />
          )}

          {badgeText && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-white/30 backdrop-blur-md border border-white/40 rounded-full shadow-sm text-xs font-bold text-indigo-900 tracking-wide z-10 max-w-[85%] truncate">
              {badgeText}
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <ShareProductButton product={product} />
            <button
              onClick={handleWishlist}
              className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-red-500 transition-all duration-300 hover:scale-110 active:scale-95 group/heart"
            >
              <Heart
                size={18}
                className={
                  isMounted && isInWishlist(product._id)
                    ? "fill-red-500 text-red-500"
                    : "text-gray-700 group-hover/heart:text-red-500"
                }
              />
            </button>
          </div>

          {inStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-xl rounded-full text-black shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white z-10"
            >
              <ShoppingBag size={18} />
            </button>
          )}
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
              Premium
            </span>
          </div>

          <h3 className="text-[15px] md:text-base font-bold text-gray-900 leading-snug mb-1 truncate font-mulish group-hover:text-indigo-700 transition-colors">
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

          <div className="mt-2">
            <StockBadge product={product} showCount />
          </div>
        </div>
      </div>
    </Link>
  );
}
