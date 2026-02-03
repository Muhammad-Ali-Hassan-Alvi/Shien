import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import FlashSaleTimer from "./FlashSaleTimer"; // Assuming this component exists or we inline the timer

export default function SuperDeals() {
    return (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100 font-sans">
            
            {/* 1. Flash Sale Block */}
            <div className="bg-white p-2">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <div className="bg-[#005AD8] text-white px-2 py-1 -skew-x-12 transform">
                            <h3 className="text-lg font-black italic tracking-tighter skew-x-12">
                                Flash Sale
                            </h3>
                        </div>
                        {/* Timer */}
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
                
                {/* Cards */}
                <div className="grid grid-cols-3 gap-3">
                     {/* Item 1 */}
                     <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 group">
                        <Image src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400" alt="Heels" fill className="object-cover" />
                        <div className="absolute top-2 left-2 bg-[#FF3B30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]">-45%</div>
                        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent pt-6">
                            <div className="font-bold text-sm text-white">Rs. 845</div>
                        </div>
                     </div>
                     {/* Item 2 */}
                     <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 group">
                        <Image src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400" alt="Headphones" fill className="object-cover" />
                        <div className="absolute top-2 left-2 bg-[#FF3B30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]">-53%</div>
                        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent pt-6">
                             <div className="font-bold text-sm text-white">Rs. 241</div>
                        </div>
                     </div>
                     {/* Item 3 */}
                     <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 group">
                         {/* Using a red sneaker image */}
                        <Image src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400" alt="Shoes" fill className="object-cover" />
                         <div className="absolute top-2 left-2 bg-[#FF3B30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]">-20%</div>
                         <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent pt-6">
                             <div className="font-bold text-sm text-white">Rs. 5019</div>
                        </div>
                     </div>
                </div>
            </div>

            {/* 2. Hot Drop Block */}
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
                     {/* Item 1 */}
                     <div className="flex flex-col gap-2">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                            <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400" alt="Fashion" fill className="object-cover" />
                        </div>
                        <div className="font-bold text-sm text-black px-1">Rs. 1999</div>
                     </div>
                     {/* Item 2 */}
                     <div className="flex flex-col gap-2">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                            <Image src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400" alt="Fashion" fill className="object-cover" />
                        </div>
                        <div className="font-bold text-sm text-black px-1">Rs. 3200</div>
                     </div>
                     {/* Item 3 */}
                     <div className="flex flex-col gap-2">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                             <Image src="https://images.unsplash.com/photo-1485230946086-1d99d5297129?q=80&w=400" alt="Fashion" fill className="object-cover" />
                        </div>
                         <div className="font-bold text-sm text-black px-1">Rs. 1500</div>
                     </div>
                </div>
            </div>

        </section>
    );
}
