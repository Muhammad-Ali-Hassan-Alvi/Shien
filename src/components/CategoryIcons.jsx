"use client";

import Image from "next/image";

const CATEGORIES = [
  { name: "Tops", image: "https://images.unsplash.com/photo-1551163943-3f6a29e39bb7?q=80&w=256&auto=format&fit=crop" },
  { name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=256&auto=format&fit=crop" },
  { name: "Active", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=256&auto=format&fit=crop" },
  { name: "Lingerie", image: "https://images.unsplash.com/photo-1596472537520-23a31e582a89?q=80&w=256&auto=format&fit=crop" },
  { name: "Jeans", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=256&auto=format&fit=crop" },
  { name: "Sets", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=256&auto=format&fit=crop" },
  { name: "Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=256&auto=format&fit=crop" },
  { name: "Bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=256&auto=format&fit=crop" },
  { name: "Suits", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=256&auto=format&fit=crop" },
  { name: "Skirts", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=256&auto=format&fit=crop" },
  { name: "Jewelry", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=256&auto=format&fit=crop" },
  { name: "Beauty", image: "https://images.unsplash.com/photo-1522335208411-2f171d4203ae?q=80&w=256&auto=format&fit=crop" },
  { name: "Kids", image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=256&auto=format&fit=crop" },
  { name: "Home", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=256&auto=format&fit=crop" },
];

export default function CategoryIcons() {
  return (
    <div className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-5 md:grid-cols-7 gap-y-6 gap-x-2 md:gap-x-8 place-items-center">
            {CATEGORIES.map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group w-full">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-[20px] md:rounded-[30px] overflow-hidden relative shadow-sm hover:shadow-md transition-all bg-gray-50">
                       <Image 
                            src={cat.image} 
                            alt={cat.name} 
                            fill 
                            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                </div>
                <span className="text-[10px] md:text-sm font-bold text-gray-800 uppercase tracking-tight">{cat.name}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
