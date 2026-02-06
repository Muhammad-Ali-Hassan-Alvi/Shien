import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function SuperDeals({ hotDrops = [], flashSale = [] }) {
    return (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100 font-sans">
            
            {/* 1. Flash Sale Block */}
            <div className="bg-white p-2">
                <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <div className="bg-[#005AD8] text-white px-2 py-1 -skew-x-12 transform">
                            <h3 className="text-lg font-black italic tracking-tighter skew-x-12">
                                Flash Sale
                            </h3>
                        </div>
                        {/* Timer Mock */}
                        <div className="flex gap-1 text-sm font-bold text-white items-center">
                            <span className="bg-black rounded-[4px] w-6 h-6 flex items-center justify-center">02</span>
                            <span className="text-black">:</span>
                            <span className="bg-black rounded-[4px] w-6 h-6 flex items-center justify-center">15</span>
                            <span className="text-black">:</span>
                            <span className="bg-black rounded-[4px] w-6 h-6 flex items-center justify-center">49</span>
                        </div>
                     </div>
                    <Link href="/?sort=flash_sale" className="text-xs text-gray-500 hover:text-black flex items-center">
                        View All <ChevronRight size={14} />
                    </Link>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                     {flashSale.length > 0 ? flashSale.slice(0, 3).map((product) => (
                        <Link href={`/product/${product.slug}`} key={product._id} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 group block">
                            <Image 
                                src={product.images?.[0] || '/placeholder.jpg'} 
                                alt={product.name} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                            {product.pricing?.discountLabel && (
                                <div className="absolute top-2 left-2 bg-[#FF3B30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]">
                                    {product.pricing.discountLabel}
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent pt-6">
                                <div className="font-bold text-sm text-white">Rs. {product.pricing?.salePrice}</div>
                            </div>
                        </Link>
                     )) : (
                        <div className="col-span-3 text-center text-gray-400 text-xs py-10">No flash sales active.</div>
                     )}
                </div>
            </div>

            {/* 2. Hot Drop Block - New Items */}
            <div className="bg-white p-2">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-black italic flex items-center text-black tracking-tight">
                        Hot Drop
                        <span className="ml-2 text-[9px] font-bold not-italic bg-[#FFE5CC] text-[#FF5F00] px-1.5 py-0.5 rounded-[2px]">New Styles</span>
                    </h3>
                    <Link href="/?sort=new" className="text-xs text-gray-500 hover:text-black flex items-center">
                        View All <ChevronRight size={14} />
                    </Link>
                </div>
                 
                <div className="grid grid-cols-3 gap-3">
                     {hotDrops.length > 0 ? hotDrops.slice(0, 3).map((product) => (
                        <Link href={`/product/${product.slug}`} key={product._id} className="flex flex-col gap-2 group">
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                                <Image 
                                    src={product.images?.[0] || '/placeholder.jpg'} 
                                    alt={product.name} 
                                    fill 
                                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            </div>
                            <div className="px-1">
                                <div className="font-bold text-sm text-black">Rs. {product.pricing?.salePrice}</div>
                                {product.pricing?.originalPrice > product.pricing?.salePrice && (
                                    <div className="text-[10px] text-gray-400 line-through">Rs. {product.pricing.originalPrice}</div>
                                )}
                            </div>
                        </Link>
                     )) : (
                        <div className="col-span-3 text-center text-gray-400 text-xs py-10">No new drops.</div>
                     )}
                </div>
            </div>

        </section>
    );
}
