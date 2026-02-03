"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { Star, Truck, ShieldCheck, RefreshCcw, Heart, Share2, Plus, Minus, ChevronRight, Copy, MapPin } from "lucide-react";
import ProductGrid from "./ProductGrid";

export default function ProductView({ product }) {
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || {});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const images = product.images.length > 0 ? product.images : ["/placeholder.jpg"];

  // Mock Data
  const soldCount = "10k+"; // Static for 'Best Seller' vibe
  const reviewCount = "1000+";
  const storeName = "bugenvzhuang"; // From image
  const sku = "sz25061734202264483";

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    openCart();
  };

  const { salePrice, originalPrice } = product.pricing;
  const discountPercent = originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-gray-800">
      
      {/* Breadcrumbs (Desktop) */}
      <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 py-3 px-4 md:px-8 max-w-[1600px] mx-auto">
        <span>Home</span> <ChevronRight size={12} />
        <span>Women Apparel</span> <ChevronRight size={12} />
        <span>Women Clothing</span> <ChevronRight size={12} />
        <span className="text-black truncate">{product.name}</span>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-10">
        
        {/* ================= LEFT COLUMN: IMAGES & REVIEWS ================= */}
        <div className="flex-1 lg:max-w-[65%]">
            
            {/* Desktop Gallery Grid */}
            <div className="hidden md:flex gap-4 mb-16">
                 {/* Vertical Thumbnails */}
                 <div className="w-24 flex flex-col gap-3 sticky top-24 h-fit">
                    {images.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveImage(idx)}
                          className={`relative w-24 h-32 cursor-pointer border-2 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                        >
                            <Image src={img} fill className="object-cover" alt="thumb" />
                        </div>
                    ))}
                 </div>
                 
                 {/* Main Image */}
                 <div className="flex-1 relative aspect-[3/4] bg-gray-50">
                    <Image src={images[activeImage]} fill className="object-cover" alt="Main" />
                 </div>
            </div>

            {/* Mobile Scroll Gallery */}
            <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory no-scrollbar h-[500px] mb-6 -mx-4">
                 {images.map((img, idx) => (
                    <div key={idx} className="min-w-full snap-center relative h-full">
                        <Image src={img} fill className="object-cover" alt={`Image ${idx}`} />
                    </div>
                 ))}
                 <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                     {activeImage + 1}/{images.length}
                 </div>
             </div>

            {/* Reviews Section (Mock matching Image 4) */}
            <div className="border-t border-gray-100 pt-8" id="reviews">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-black">Customer Reviews ({reviewCount})</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold">4.91</span>
                        <div className="flex text-black">
                             {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="black" />)}
                        </div>
                    </div>
                </div>

                {/* Review Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {["Good Fabric Material (100+)", "Will Repurchase (8)", "No Smell (100+)", "Fast Logistics (16)", "Gorgeous (39)"].map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-[#F6F6F6] text-xs text-black rounded-sm cursor-pointer hover:bg-gray-200 transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Individual Review Item */}
                <div className="border-b border-gray-100 pb-8 mb-8">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-xs">k***e</span>
                             <span className="text-xs text-gray-400">14 Dec, 2025</span>
                        </div>
                        <div className="flex text-[#FFB800]">
                             {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" className="text-[#FFB800]" />)}
                        </div>
                     </div>
                     
                     <div className="text-xs text-gray-500 mb-3 space-y-1">
                        <p>Overall Fit: <span className="text-black">True to Size</span></p>
                        <p>Height: 162 cm / 64 in  Weight: 67 kg / 148 lbs</p>
                     </div>

                     <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                        This is gorgeous love the color. It looks like the picture. Please like if this has helped you. I highly recommend 🥰🥰
                     </p>
                     
                     <div className="flex gap-2">
                         <div className="w-20 h-24 relative bg-gray-100 rounded overflow-hidden">
                             {/* Mock review image */}
                             <div className="absolute inset-0 bg-gray-200"></div>
                         </div>
                         <div className="w-20 h-24 relative bg-gray-100 rounded overflow-hidden">
                             <div className="absolute inset-0 bg-gray-200"></div>
                         </div>
                     </div>
                </div>

                <div className="border-b border-gray-100 pb-8">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                             <span className="font-bold text-xs">f***1</span>
                             <span className="text-xs text-gray-400">9 Oct, 2025</span>
                        </div>
                        <div className="flex text-[#FFB800]">
                             {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" className="text-[#FFB800]" />)}
                        </div>
                     </div>
                     <p className="text-sm text-gray-800 mb-4">Cute top!</p>
                </div>

            </div>

        </div>


        {/* ================= RIGHT COLUMN: DETAILS ================= */}
        <div className="w-full lg:w-[35%] relative">
             <div className="sticky top-24">
                 
                 {/* Title & SKU */}
                 <div className="mb-4">
                     <h1 className="text-lg md:text-xl text-gray-900 leading-snug mb-2 font-normal">
                         {product.name}
                     </h1>
                     <div className="flex items-center gap-4 text-xs text-gray-500">
                         <span className="flex items-center gap-1">SKU: {sku} <Copy size={12} className="cursor-pointer" /></span>
                         <div className="flex items-center gap-1 text-[#FFB800]">
                             <Star size={12} fill="currentColor" />
                             <Star size={12} fill="currentColor" />
                             <Star size={12} fill="currentColor" />
                             <Star size={12} fill="currentColor" />
                             <Star size={12} fill="currentColor" />
                             <span className="text-blue-500 underline ml-1">({reviewCount} Reviews)</span>
                         </div>
                     </div>
                 </div>

                 {/* Price */}
                 <div className="flex items-baseline gap-2 mb-2">
                     <span className="text-3xl font-bold text-[#FA6338]">
                         ${(salePrice / 278).toFixed(2)} {/* Mock conversion to USD for aesthetic or keep RS */}
                     </span>
                     {originalPrice > salePrice && (
                         <>
                             <span className="text-gray-400 line-through text-sm">${(originalPrice / 278).toFixed(2)}</span>
                             <span className="bg-black text-white text-xs font-bold px-1.5 py-0.5">-{discountPercent}%</span>
                         </>
                     )}
                 </div>
                 
                 {/* Bestseller Tag */}
                 <div className="bg-[#FFF6DD] text-[#D89324] inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-sm mb-6">
                     <span>🏆 #1 Bestseller</span>
                     <span className="font-normal text-gray-600">in Pocket Women Blouses</span>
                 </div>


                 {/* Colors */}
                 <div className="mb-6">
                     <div className="flex justify-between items-center mb-3">
                         <span className="text-sm font-bold">Color: <span className="font-normal">{selectedVariant.color}</span></span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                         {product.variants.slice(0, 5).map((v, i) => (
                             <div 
                                key={i} 
                                className={`w-12 h-16 border-2 relative cursor-pointer ${selectedVariant.color === v.color ? 'border-[#FA6338]' : 'border-transparent hover:border-gray-300'}`}
                                onClick={() => setSelectedVariant(v)}
                             >
                                 {/* Use main product image as color swatches for demo */}
                                 <Image src={images[i % images.length]} fill className="object-cover p-0.5" alt="color" />
                                 {i === 0 && <span className="absolute -top-2 -right-2 bg-[#FA6338] text-white text-[8px] px-1 rounded">HOT</span>}
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Sizes */}
                 <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                         <span className="text-sm font-bold">Size: <span className="font-normal">{selectedVariant.size}</span></span>
                         <span className="text-xs text-blue-600 underline cursor-pointer">Size Guide</span>
                     </div>
                     <div className="flex flex-wrap gap-3">
                         {["XS", "S", "M", "L", "XL", "Petite", "Curve"].map((size) => (
                             <button
                                 key={size}
                                 className={`min-w-[40px] px-3 py-2 text-sm border rounded-full hover:border-black ${selectedVariant.size === size ? 'border-black font-bold' : 'border-gray-300'}`}
                             >
                                 {size}
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Add to Cart Actions */}
                 <div className="flex flex-col gap-3 mb-8">
                     <button 
                        onClick={handleAddToCart}
                        className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg"
                     >
                         Add to Cart
                     </button>
                     <div className="flex gap-4 text-xs text-gray-500 justify-center mt-2">
                        <span className="flex items-center gap-1"><Truck size={14}/> Free Shipping</span>
                        <span className="flex items-center gap-1"><RefreshCcw size={14}/> Free Returns</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={14}/> Secure Payment</span>
                     </div>
                 </div>

                 {/* Store Info Widget (Image 5) */}
                 <div className="border border-gray-200 rounded p-4 mb-6">
                     <div className="flex justify-between items-start mb-4">
                         <div className="flex gap-3">
                             <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-xs font-bold">
                                 LOGO
                             </div>
                             <div>
                                 <h4 className="font-bold text-sm mb-1">{storeName}</h4>
                                 <div className="flex items-center gap-3 text-xs text-gray-500">
                                     <span className="flex items-center gap-1 text-black font-bold">4.91 <Star size={10} fill="black"/></span>
                                     <span>223 Items</span>
                                     <span>9.6K Followers</span>
                                 </div>
                             </div>
                         </div>
                         <button className="border border-black px-4 py-1 text-xs font-bold uppercase hover:bg-gray-50">
                             + Follow
                         </button>
                     </div>
                     <div className="flex gap-4 text-xs">
                         <div className="flex items-center gap-1">
                             <span className="text-[#FA6338]">High Repeat Customers</span>
                         </div>
                         <div className="flex items-center gap-1 text-gray-500">
                             <span className="bg-green-100 text-green-700 px-1 rounded">Established 1 Year Ago</span>
                         </div>
                     </div>
                     <div className="flex justify-between gap-2 mt-4">
                         <button className="flex-1 border border-gray-200 py-2 text-sm text-gray-600 hover:border-gray-400">All Items</button>
                     </div>
                 </div>

             </div>
        </div>

      </div>

      {/* Suggested Products */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 border-t border-gray-100 mt-12">
          <h2 className="text-xl font-bold mb-6">Matching Styles</h2>
          <ProductGrid initialProducts={[]} />
      </div>

    </div>
  );
}
