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
];

export default function CategoryIcons() {
  return (
    <div className="py-6 overflow-x-auto no-scrollbar bg-white">
      <div className="flex px-4 space-x-6 min-w-max">
        {CATEGORIES.map((cat, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-16 h-20 md:w-24 md:h-28 rounded-[30px] overflow-hidden border border-gray-100 p-[2px] ring-2 ring-transparent group-hover:ring-red-500 transition-all bg-white shadow-sm">
               <div className="w-full h-full rounded-[28px] overflow-hidden relative">
                   <Image 
                        src={cat.image} 
                        alt={cat.name} 
                        fill 
                        className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
               </div>
            </div>
            <span className="text-xs font-medium text-gray-700">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
