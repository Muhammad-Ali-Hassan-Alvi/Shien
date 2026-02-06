"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-white/60 backdrop-blur-xl border-t border-white/40 pt-24 pb-12 overflow-hidden">
      
      {/* Artistic Watermark Background */}
      <h1 className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 text-[15vw] font-black text-black/[0.03] pointer-events-none select-none tracking-tighter leading-none whitespace-nowrap z-0">
        SHEIN LUXE
      </h1>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top: Newsletter & Branding */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
            <div className="max-w-md">
                <h3 className="text-4xl font-playfair font-medium text-gray-900 mb-6 tracking-tight">
                    Stay ahead of the trend.
                </h3>
                <p className="text-gray-500 mb-8 font-light">
                    Join our newsletter to receive exclusive offers, new collection alerts, and style inspiration directly to your inbox.
                </p>
                
                <form className="flex group">
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="bg-transparent border-b border-gray-300 py-3 pr-4 w-full outline-none focus:border-black transition-colors placeholder:text-gray-400 group-hover:border-gray-400"
                    />
                    <button className="border-b border-gray-300 py-3 pl-4 hover:text-indigo-600 transition-colors group-hover:border-gray-400">
                        <ArrowRight size={20} />
                    </button>
                </form>
            </div>

            <div className="flex gap-4">
                 {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                     <a key={i} href="#" className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                         <Icon size={18} />
                     </a>
                 ))}
            </div>
        </div>

        {/* Middle: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-t border-gray-200 pt-16">
            <div className="space-y-6">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900">Valid Company</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                    <li><Link href="/" className="hover:text-black transition-colors">About Us</Link></li>
                    <li><Link href="/" className="hover:text-black transition-colors">Sustainability</Link></li>
                    <li><Link href="/" className="hover:text-black transition-colors">Careers</Link></li>
                    <li><Link href="/" className="hover:text-black transition-colors">Press</Link></li>
                </ul>
            </div>
            
            <div className="space-y-6">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900">Customer Care</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                    <li><Link href="/" className="hover:text-black transition-colors">Help Center</Link></li>
                    <li><Link href="/" className="hover:text-black transition-colors">Returns & Refunds</Link></li>
                    <li><Link href="/" className="hover:text-black transition-colors">Shipping Info</Link></li>
                    <li><Link href="/" className="hover:text-black transition-colors">Size Guide</Link></li>
                </ul>
            </div>

            <div className="space-y-6">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900">Quick Links</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                     <li><Link href="/" className="hover:text-black transition-colors">New Arrivals</Link></li>
                     <li><Link href="/" className="hover:text-black transition-colors">Best Sellers</Link></li>
                     <li><Link href="/" className="hover:text-black transition-colors">Sale</Link></li>
                     <li><Link href="/" className="hover:text-black transition-colors">Gift Cards</Link></li>
                </ul>
            </div>

            <div className="space-y-6">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                    <li><Link href="/" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                    <li><Link href="/" className="hover:text-black transition-colors">Terms of Service</Link></li>
                    <li><Link href="/" className="hover:text-black transition-colors">Cookie Policy</Link></li>
                </ul>
            </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400 font-medium">© 2025 SHEIN. All rights reserved.</p>
            <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                {/* Mock Payment Badges - Text or SVGs */}
                <span className="font-black italic text-lg text-gray-800">VISA</span>
                <span className="font-black italic text-lg text-gray-800">PayPal</span>
                <span className="font-black italic text-lg text-gray-800">MasterCard</span>
            </div>
        </div>

      </div>
    </footer>
  );
}
