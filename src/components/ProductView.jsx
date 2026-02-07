"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { Star, Truck, ShieldCheck, RefreshCcw, Heart, Share2, Plus, Minus, ChevronRight, Copy, MapPin } from "lucide-react";
import ProductGrid from "./ProductGrid";
import Link from "next/link";
import ProductQA from "./ProductQA";

export default function ProductView({ product }) {
  const { addItem } = useCartStore();
  const { openCart } = useUIStore();
  
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || {});
  const [activeImage, setActiveImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  const images = product.images?.length > 0 ? product.images : ["/placeholder.jpg"];

  // Mock Data
  const reviewCount = "1.2k";
  const storeName = "iMART PREMIUM"; 
  const sku = product.sku || "SZ-25061734";

  const handleAddToCart = () => {
    addItem(product, selectedVariant);
    openCart();
  };

  const { salePrice, originalPrice } = product.pricing;
  const discountPercent = originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Mock Recommendations
  const recommendedProducts = [
     { _id: 'rec1', name: "Matching Mini Skirt", slug: "skirt", pricing: { salePrice: 1500, originalPrice: 2000 }, images: [images[0]] },
     { _id: 'rec2', name: "Premium Silk Scarf", slug: "scarf", pricing: { salePrice: 850, originalPrice: 1200 }, images: [images[0]] },
     { _id: 'rec3', name: "Golden Hoops", slug: "hoops", pricing: { salePrice: 500, originalPrice: 800 }, images: [images[0]] },
     { _id: 'rec4', name: "Leather Tote Bag", slug: "bag", pricing: { salePrice: 4500, originalPrice: 6000 }, images: [images[0]] },
  ];

  return (
    <div className="min-h-screen text-gray-800 pb-20">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500 py-4 px-4 md:px-8 max-w-[1600px] mx-auto">
        <Link href="/" className="hover:text-black">Home</Link> <ChevronRight size={12} />
        <Link href="/" className="hover:text-black">Women</Link> <ChevronRight size={12} />
        <span className="text-black font-semibold truncate">{product.name}</span>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-8 relative">
        
        {/* ================= LEFT COLUMN: IMAGES (Smaller Width 40%) ================= */}
        <div className="w-full lg:w-[45%] flex gap-4">
             {/* Vert Thumbnails */}
             <div className="hidden md:flex flex-col gap-3 w-20 sticky top-24 h-fit">
                {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-24 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                    >
                        <Image src={img} fill className="object-cover" alt="thumb" />
                    </div>
                ))}
             </div>
             
             {/* Main Image with Zoom */}
             <div 
                className="flex-1 relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden cursor-crosshair group"
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
             >
                <Image src={images[activeImage]} fill className="object-cover transition-transform duration-500" alt="Main" priority />
                
                {/* Mobile Zoom Hint */}
                <div className="absolute bottom-4 right-4 md:hidden bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                    Tap to zoom
                </div>
             </div>

             {/* ZOOM MODAL (Portal-like absolute div) */}
             {showZoom && (
                 <div 
                    className="hidden lg:block absolute left-[46%] top-0 w-[500px] h-[600px] bg-white border border-gray-200 shadow-2xl z-50 rounded-xl overflow-hidden pointer-events-none ml-4"
                    style={{
                        backgroundImage: `url(${images[activeImage]})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundSize: '200%' // Zoom level
                    }}
                 >
                     <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                         Zoom View
                     </div>
                 </div>
             )}
        </div>


        {/* ================= RIGHT COLUMN: DETAILS ================= */}
        <div className="flex-1 max-w-2xl">
             <div className="sticky top-24">
                 
                 {/* Title & Badge */}
                 <div className="mb-4">
                     <div className="flex gap-2 mb-2">
                         <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">Premium Selection</span>
                         {discountPercent > 0 && <span className="bg-[#FA6338] text-white text-[10px] font-bold px-2 py-0.5 uppercase"> -{discountPercent}% OFF</span>}
                     </div>
                     <h1 className="text-2xl md:text-3xl font-playfair font-medium text-gray-900 leading-snug mb-2">
                         {product.name}
                     </h1>
                     <div className="flex items-center gap-4 text-xs text-gray-500">
                         <span className="flex items-center gap-1">SKU: {sku} <Copy size={12} /></span>
                         <div className="flex items-center gap-1 text-[#FFB800]">
                             {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                             <span className="text-blue-600 underline ml-1">({reviewCount} Reviews)</span>
                         </div>
                     </div>
                 </div>

                 {/* Price */}
                 <div className="flex items-baseline gap-3 mb-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100 backdrop-blur-sm">
                     <span className="text-4xl font-bold font-playfair text-gray-900">
                         Rs. {salePrice.toLocaleString()}
                     </span>
                     {originalPrice > salePrice && (
                         <span className="text-gray-400 line-through text-lg">Rs. {originalPrice.toLocaleString()}</span>
                     )}
                 </div>

                 {/* Interactive Elements (Colors/Sizes) */}
                 <div className="space-y-6 mb-8">
                     {/* Color */}
                     <div>
                         <span className="text-sm font-bold block mb-2">Color: {selectedVariant.color || 'Default'}</span>
                         <div className="flex gap-2">
                             {product.variants?.map((v, i) => (
                                 <button 
                                    key={i}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedVariant.color === v.color ? 'border-black scale-110' : 'border-transparent hover:border-gray-300'}`}
                                    title={v.color}
                                 >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                        <Image src={images[i % images.length]} width={32} height={32} className="object-cover w-full h-full" alt="color" />
                                    </div>
                                 </button>
                             ))}
                         </div>
                     </div>

                     {/* Size */}
                     <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold">Size: {selectedVariant.size || 'One Size'}</span>
                            <button className="text-xs underline text-gray-500">Size Guide</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedVariant({...selectedVariant, size})}
                                    className={`px-4 py-2 border rounded-lg text-sm transition-all ${selectedVariant.size === size ? 'border-black bg-black text-white shadow-lg' : 'border-gray-200 hover:border-black'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                     </div>
                 </div>

                 {/* Actions */}
                 <div className="flex flex-col gap-3 mb-8">
                     <button 
                        onClick={handleAddToCart}
                        className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-900 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                         <ShoppingBag size={20} /> Add to Cart
                     </button>
                     <button className="w-full border border-gray-300 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                         <Heart size={18} /> Add to Wishlist
                     </button>
                 </div>

                 {/* Service Badges */}
                 <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col items-center gap-1">
                        <Truck size={16} className="text-gray-900"/> <span>Free Shipping &gt;$50</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <ShieldCheck size={16} className="text-gray-900"/> <span>Secure Payment</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <RefreshCcw size={16} className="text-gray-900"/> <span>Free Returns</span>
                    </div>
                 </div>

             </div>
        </div>

      </div>

      <ProductQA product={product} />

      {/* Recommended Products */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-24">
          <h2 className="text-2xl font-playfair font-bold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendedProducts.map((p) => (
                  <Link href={`/product/${p.slug}`} key={p._id} className="group cursor-pointer">
                      <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3">
                          <Image src={p.images[0]} fill className="object-cover transition-transform duration-500 group-hover:scale-110" alt={p.name} />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                      </div>
                      <h3 className="font-bold text-sm truncate">{p.name}</h3>
                      <p className="text-sm text-gray-500">Rs. {p.pricing.salePrice}</p>
                  </Link>
              ))}
          </div>
      </div>

    </div>
  );
}

function ShoppingBag({size, className}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    )
}
