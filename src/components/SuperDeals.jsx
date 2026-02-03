import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Zap } from "lucide-react";

export default function SuperDeals() {
    return (
        <section className="max-w-7xl mx-auto px-4 md:px-12 py-8 grid grid-cols-1 md:grid-cols-3 gap-4" style={{ fontFamily: 'system-ui' }}>
            
            {/* 1. Super Deals Card */}
            <div className="bg-white p-4 rounded-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-black italic flex items-center">
                        Super <Zap size={20} className="text-red-500 fill-current mx-0.5" /> Deals
                    </h3>
                    <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="flex gap-2 h-48">
                     <div className="flex-1 relative bg-gray-50">
                        <Image src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=300" alt="Sandals" fill className="object-cover p-2" />
                        <div className="absolute bottom-0 left-0 p-2 bg-white/90 w-full">
                            <div className="font-bold text-xl" style={{ color: '#f93a00' }}>Rs. 845</div>
                            <div className="text-xs text-[#f93a00]/80 font-medium">Flash Sale</div>
                        </div>
                     </div>
                     <div className="flex-1 relative bg-gray-50">
                        <Image src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=300" alt="Electronics" fill className="object-cover p-2" />
                        <div className="absolute bottom-0 left-0 p-2 bg-white/90 w-full">
                             <div className="font-bold text-xl" style={{ color: '#f93a00' }}>Rs. 241</div>
                             <div className="text-xs text-[#f93a00]/80 font-medium">53% OFF</div>
                        </div>
                     </div>
                </div>
            </div>

            {/* 2. Top Trends Card */}
            <div className="bg-white p-4 rounded-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-black italic flex items-center">
                        Top <span className="text-purple-500 mx-1">↑</span> Trends
                    </h3>
                    <ChevronRight size={20} className="text-gray-400" />
                </div>
                 <div className="flex gap-2 h-48">
                     <div className="flex-1 relative bg-gray-50">
                        <Image src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300" alt="Sneakers" fill className="object-cover p-2" />
                        <div className="absolute bottom-0 left-0 p-2 bg-white/90 w-full">
                            <div className="font-bold text-xl" style={{ color: '#f93a00' }}>Rs. 5019</div>
                            <div className="text-xs font-medium" style={{ color: '#9462ff' }}>#SignatureEdit</div>
                        </div>
                     </div>
                     <div className="flex-1 relative bg-gray-50">
                         <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300" alt="Fashion" fill className="object-cover p-2" />
                         <div className="absolute bottom-0 left-0 p-2 bg-white/90 w-full">
                             <div className="font-bold text-xl" style={{ color: '#f93a00' }}>Rs. 1999</div>
                             <div className="text-xs font-medium" style={{ color: '#9462ff' }}>#SummerVibes</div>
                        </div>
                     </div>
                </div>
            </div>

            {/* 3. Brand Zone Card */}
            <div className="bg-white p-4 rounded-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black italic flex items-center">
                        Brand Z<span className="text-orange-500 text-sm align-top mx-0.5">★</span>ne
                    </h3>
                    <ChevronRight size={20} className="text-gray-400" />
                </div>
                 <div className="flex gap-2 h-48">
                     <div className="flex-1 relative bg-gray-50">
                        <span className="absolute top-0 left-0 bg-black text-white text-[10px] px-1 z-10">SHEIN</span>
                        <Image src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300" alt="Headphones" fill className="object-cover p-2" />
                        <div className="absolute bottom-0 left-0 p-2 bg-white/90 w-full">
                            <div className="font-bold text-xl" style={{ color: '#f93a00' }}>Rs. 10037</div>
                            <div className="text-xs text-[#f93a00]/80 font-medium">49% OFF</div>
                        </div>
                     </div>
                     <div className="flex-1 relative bg-gray-50">
                        <span className="absolute top-0 left-0 bg-black text-white text-[10px] px-1 z-10">Dell</span>
                        <Image src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=300" alt="Laptop" fill className="object-cover p-2" />
                         <div className="absolute bottom-0 left-0 p-2 bg-white/90 w-full">
                             <div className="font-bold text-xl" style={{ color: '#f93a00' }}>Rs. 21097</div>
                             <div className="text-xs text-[#f93a00]/80 font-medium">47% OFF</div>
                        </div>
                     </div>
                </div>
            </div>

        </section>
    );
}
