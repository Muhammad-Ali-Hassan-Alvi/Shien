"use client";

import { useState } from "react";
import clsx from "clsx";
import FlashSaleTimer from "./FlashSaleTimer";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { Star, Truck, ShieldCheck, RefreshCcw, Headset, Heart, Share2, Plus, Minus } from "lucide-react";
import ProductGrid from "./ProductGrid";

export default function ProductView({ product }) {
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || {});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const images = product.images.length > 0 ? product.images : ["/placeholder.jpg"];

  // Fake "Shein" Sales Data
  const soldCount = Math.floor(Math.random() * 5000) + 1000;
  const rating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 500) + 50;

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    openCart();
  };

  const { salePrice, originalPrice, discountLabel } = product.pricing;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* 1. Mobile Top Bar (Nav is already sticky, so we just pad) */}
      
      <div className="md:max-w-7xl md:mx-auto md:px-8 md:py-8 md:grid md:grid-cols-2 md:gap-12">
        
        {/* LEFT COLUMN: Gallery */}
        <div className="relative">
             {/* Mobile: Horizontal Scroll Snap */}
             <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory no-scrollbar h-[500px]">
                 {images.map((img, idx) => (
                    <div key={idx} className="min-w-full snap-center relative h-full">
                        <Image src={img} fill className="object-cover" alt={`Image ${idx}`} priority={idx === 0} />
                    </div>
                 ))}
                 <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                     1/{images.length}
                 </div>
             </div>

             {/* Desktop: Grid/Main Image */}
             <div className="hidden md:flex gap-4">
                 <div className="flex flex-col gap-4">
                    {images.map((img, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setActiveImage(idx)}
                          className={`relative w-20 h-24 border-2 ${activeImage === idx ? 'border-black' : 'border-transparent'}`}
                        >
                            <Image src={img} fill className="object-cover" alt="thumb" />
                        </button>
                    ))}
                 </div>
                 <div className="relative flex-1 aspect-[3/4]">
                    <Image src={images[activeImage]} fill className="object-cover" alt="Main" />
                 </div>
             </div>
        </div>

        {/* RIGHT COLUMN: Product Info */}
        <div className="px-4 py-4 md:px-0">
            {/* Flash Sale Bar */}
            <div className="bg-red-50 text-red-600 px-3 py-2 text-sm font-bold flex justify-between items-center rounded-sm mb-4">
                <span className="flex items-center gap-2">
                    ⚡ FLASH SALE
                </span>
                <FlashSaleTimer />
            </div>

            <div className="flex justify-between items-start mb-2">
                <h1 className="text-xl md:text-2xl text-gray-800 font-medium leading-snug">{product.name}</h1>
                <Share2 size={20} className="text-gray-500" />
            </div>

            {/* Price Block */}
            <div className="flex items-end gap-3 mb-4">
                <span className="text-2xl font-bold text-red-600">Rs. {salePrice}</span>
                {originalPrice > salePrice && (
                    <>
                        <span className="text-gray-400 line-through text-sm">Rs. {originalPrice}</span>
                        <span className="text-red-600 bg-red-100 px-1.5 py-0.5 text-xs font-bold rounded">-{Math.round(((originalPrice - salePrice) / originalPrice) * 100)}%</span>
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-1">
                    <Star size={14} className="fill-black text-black" />
                    <span className="font-bold text-black">{rating}</span>
                </div>
                <span className="underline">{reviewCount} Reviews</span>
                <span>|</span>
                <span>{soldCount}+ Sold</span>
            </div>

            {/* Variant Selectors */}
            <div className="space-y-6 mb-8">
                {/* Sizes */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold">Size: {selectedVariant.size}</span>
                        <span className="text-xs text-gray-500 underline">Size Guide</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {product.variants.map((v, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedVariant(v)}
                                className={`px-4 py-2 rounded-full text-sm border ${
                                    selectedVariant === v 
                                    ? 'border-black bg-black text-white' 
                                    : 'border-gray-300 text-gray-700 hover:border-black'
                                }`}
                            >
                                {v.size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colors (Mock) */}
                <div>
                     <span className="text-sm font-bold mb-2 block">Color: {selectedVariant.color}</span>
                     <div className="flex gap-2">
                         {['Black', 'Red', 'Blue'].map(c => (
                             <div key={c} className="w-8 h-8 rounded-full border border-gray-200 p-[2px] cursor-pointer hover:border-black">
                                 <div className="w-full h-full rounded-full" style={{ backgroundColor: c.toLowerCase() }}></div>
                             </div>
                         ))}
                     </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">Quantity</span>
                    <div className="flex items-center border border-gray-300 rounded">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100"><Minus size={16}/></button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100"><Plus size={16}/></button>
                    </div>
                </div>
            </div>

            {/* Desktop Add to Cart */}
            <div className="hidden md:flex gap-4">
                <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800"
                >
                    Add to Cart
                </button>
                <button className="flex-1 border border-black py-4 font-bold uppercase tracking-widest hover:bg-gray-50">
                    Buy Now
                </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 py-6 border-t border-gray-100">
                <div className="flex flex-col items-center text-center gap-2">
                    <Truck size={20} className="text-gray-600" />
                    <span className="text-[10px] text-gray-500">Free Shipping<br/>On Orders Rs.5000+</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <RefreshCcw size={20} className="text-gray-600" />
                    <span className="text-[10px] text-gray-500">7 Days<br/>Easy Return</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <ShieldCheck size={20} className="text-gray-600" />
                    <span className="text-[10px] text-gray-500">100% Secure<br/>Payment</span>
                </div>
            </div>
            
            {/* Description Accordion (Mock) */}
            <div className="border-t border-gray-100 py-4">
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Elevate your wardrobe with our {product.name}. Designed for the modern woman who values both style and comfort. 
                    Made from premium fabrics that drape beautifully. Perfect for any occasion.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                    <li>Premium Quality Fabric</li>
                    <li>Breathable & Lightweight</li>
                    <li>Machine Washable</li>
                </ul>
            </div>
        </div>
      </div>

      {/* Suggested Products */}
      <div className="px-4 md:px-8 py-8 border-t border-gray-100 mt-8">
          <h2 className="text-xl font-bold font-playfair mb-6">You Might Also Like</h2>
          {/* We pass empty initialProducts, forcing ProductGrid to fetch fresh random/recommendations if we implemented that API. 
              For now it just fetches default list which works as "More Items". */}
          <ProductGrid initialProducts={[]} />
      </div>

      {/* 2. Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:hidden flex gap-3 z-40 pb-safe">
          <div className="flex gap-2">
              <button className="flex flex-col items-center justify-center px-2 text-xs text-gray-500">
                  <Headset size={20} />
                  <span>Chat</span>
              </button>
              <button className="flex flex-col items-center justify-center px-2 text-xs text-gray-500">
                   <Heart size={20} />
                   <span>Save</span>
              </button>
          </div>
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-black text-white rounded-md font-bold uppercase text-sm"
          >
              Add to Cart
          </button>
      </div>
    </div>
  );
}
