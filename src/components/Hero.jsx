"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Slides fetched from API


export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch slides
    const fetchSlides = async () => {
        try {
            const res = await fetch("/api/hero");
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setSlides(data);
            } else {
                // Fallback to defaults if DB is empty for demo purposes
                setSlides([
                  {
                    _id: 1,
                    image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=2070&auto=format&fit=crop",
                    title: "SHIPPED FROM LOCAL WAREHOUSE",
                    subtitle: "Up to 90% OFF",
                    cta: "Shop Now",
                    link: "/#shop"
                  },
                  {
                    _id: 2,
                    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
                    title: "SUMMER COLLECTION 2026",
                    subtitle: "New Styles Added",
                    cta: "Explore",
                    link: "/#shop"
                  }
                ]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading) return <div className="h-[280px] bg-gray-100 animate-pulse rounded-sm"></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
      {/* Main Gradient Banner */}
      <div className="relative w-full h-[180px] md:h-[300px] bg-gradient-to-r from-violet-200 via-purple-200 to-indigo-200 rounded-2xl overflow-hidden flex items-center justify-between px-6 md:px-16 shadow-sm">
          
          {/* Text Content */}
          <div className="relative z-10 flex flex-col gap-2 md:gap-4 max-w-[50%]">
             <div className="flex items-center gap-2">
                 <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-purple-700 shadow-sm">#TRENDING</span>
                 <span className="text-purple-900/60 font-medium text-xs hidden md:block">Spring Collection 2026</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-black text-purple-900 tracking-tight leading-none italic font-sans">
                 Trends <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 not-italic">Shop Now</span>
             </h1>
             <Link href="/?sort=new" className="mt-2 inline-flex items-center justify-center bg-black text-white px-6 py-2 md:py-3 rounded-full font-bold text-sm hover:bg-gray-900 transition-all w-fit">
                 Discover More <ChevronRight size={16} className="ml-1" />
             </Link>
          </div>

          {/* Right Floating Images (Visual Flair) */}
          <div className="relative h-full w-[50%] hidden md:flex items-center justify-end gap-4">
              <div className="relative w-40 h-56 -rotate-6 rounded-xl overflow-hidden shadow-lg border-4 border-white transform hover:-translate-y-2 transition-transform duration-500">
                  <Image src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400" alt="Trend 1" fill className="object-cover" />
                  <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-sm">-30%</div>
              </div>
              <div className="relative w-40 h-56 rotate-6 rounded-xl overflow-hidden shadow-lg border-4 border-white transform hover:-translate-y-2 transition-transform duration-500 z-10">
                  <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400" alt="Trend 2" fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 text-center">
                      <span className="text-xs font-bold text-black block">New Items</span>
                  </div>
              </div>
          </div>
          
           {/* Mobile Image (Simplified) */}
           <div className="absolute right-0 top-0 bottom-0 w-[45%] md:hidden mask-gradient-to-l">
               <Image src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600" alt="Hero" fill className="object-cover opacity-90" />
               <div className="absolute inset-0 bg-gradient-to-r from-violet-200 via-violet-200/50 to-transparent"></div>
           </div>

      </div>
    </div>
  );
}
