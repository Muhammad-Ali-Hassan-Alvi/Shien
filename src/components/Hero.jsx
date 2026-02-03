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
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-4" style={{ fontFamily: 'system-ui' }}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-auto md:h-[230px]">
        
        {/* Left Column (Categories) - 3/12 width */}
        <div className="md:col-span-3 flex flex-col gap-2 sustemh-full">
          <Link href="/?sort=bestsellers" className="relative flex-1 bg-gray-100 overflow-hidden group rounded-sm">
             <Image src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600" alt="Hot Sellers" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
             {/* Gradient Bar */}
             <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[85%] h-10 bg-gradient-to-r from-black/90 to-transparent flex items-center px-4">
                <span className="text-white font-bold text-sm md:text-base uppercase tracking-wider shadow-sm">Hot Sellers</span>
             </div>
          </Link>
          <Link href="/?sort=new" className="relative flex-1 bg-gray-100 overflow-hidden group rounded-sm">
             <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600" alt="New Arrivals" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
             <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[85%] h-10 bg-gradient-to-r from-black/90 to-transparent flex items-center px-4">
                <span className="text-white font-bold text-sm md:text-base uppercase tracking-wider shadow-sm">New Arrivals</span>
             </div>
          </Link>
          <Link href="/?category=men" className="relative flex-1 bg-gray-100 overflow-hidden group rounded-sm">
             <Image src="https://images.unsplash.com/photo-1488161628813-99ab63268b5a?q=80&w=600" alt="Menswear Trends" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
             <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[85%] h-10 bg-gradient-to-r from-black/90 to-transparent flex items-center px-4">
                <span className="text-white font-bold text-sm md:text-base uppercase tracking-wider shadow-sm">Menswear Trends</span>
             </div>
          </Link>
        </div>

        {/* Middle Column (Main Slider) - 6/12 width */}
        <div className="md:col-span-6 relative bg-gray-100 overflow-hidden rounded-sm group h-[250px] md:h-full">
            {slides.map((slide, index) => (
                <div 
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* Centered Content */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6 drop-shadow-lg">
                        <span className="bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest mb-3 rounded-sm">{slide.subtitle}</span>
                        <h2 className="text-2xl md:text-5xl font-playfair font-black mb-5 leading-tight max-w-lg">
                            {slide.title}
                        </h2>
                        <Link href={slide.link} className="bg-white text-black px-6 py-2 font-bold uppercase hover:bg-red-600 hover:text-white transition-colors text-xs tracking-widest">
                            {slide.cta}
                        </Link>
                    </div>
                </div>
            ))}
            
            {/* Arrows */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight size={20} />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-5' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </div>

        {/* Right Column (Brands/Promo) - 3/12 width */}
        <div className="md:col-span-3 flex flex-col gap-2 h-full">
          <div className="relative flex-1 bg-gray-200 overflow-hidden flex items-center justify-center group rounded-sm">
             <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600" alt="Brand 1" fill className="object-cover opacity-70 group-hover:opacity-60 transition-opacity" />
             <span className="relative z-10 font-playfair text-xl font-bold text-white italic tracking-widest drop-shadow-md">ROMWE</span>
          </div>
          <div className="relative flex-1 bg-gray-200 overflow-hidden flex items-center justify-center group rounded-sm">
              <Image src="https://images.unsplash.com/photo-1581044777550-4cfa607037dc?q=80&w=600" alt="Brand 2" fill className="object-cover opacity-70 group-hover:opacity-60 transition-opacity" />
             <span className="relative z-10 font-playfair text-lg font-bold text-white tracking-widest uppercase drop-shadow-md text-center px-1">Emery Rose</span>
          </div>
          <div className="relative flex-1 bg-gray-200 overflow-hidden flex items-center justify-center group rounded-sm">
              <Image src="https://images.unsplash.com/photo-1509631179647-0177f4cdced2?q=80&w=600" alt="Brand 3" fill className="object-cover opacity-70 group-hover:opacity-60 transition-opacity" />
             <span className="relative z-10 font-playfair text-xl font-bold text-white tracking-widest drop-shadow-md">MOTF</span>
          </div>
        </div>

      </div>
    </div>
  );
}
