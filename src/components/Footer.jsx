import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Info } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#fff] pt-12 pb-24 md:pb-8 border-t border-gray-100 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">
          
          {/* Left Columns Information */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 text-xs text-gray-600">
             
             {/* 1. Company Info */}
              <div>
                <h4 className="font-bold text-sm text-black mb-4">COMPANY INFO</h4>
                <ul className="space-y-3">
                  <li><Link href="/" className="hover:text-black">About SHEIN</Link></li>
                  <li><Link href="/" className="hover:text-black">Social Responsibility</Link></li>
                  <li><Link href="/" className="hover:text-black">Careers</Link></li>
                </ul>
              </div>

              {/* 2. Help & Support */}
              <div>
                <h4 className="font-bold text-sm text-black mb-4">HELP & SUPPORT</h4>
                <ul className="space-y-3">
                  <li><Link href="/" className="hover:text-black">Shipping Info</Link></li>
                  <li><Link href="/" className="hover:text-black">Returns</Link></li>
                  <li><Link href="/" className="hover:text-black">Refund</Link></li>
                  <li><Link href="/" className="hover:text-black">How To Order</Link></li>
                  <li><Link href="/" className="hover:text-black">How To Track</Link></li>
                  <li><Link href="/" className="hover:text-black">Size Guide</Link></li>
                  <li><Link href="/" className="hover:text-black">SHEIN VIP</Link></li>
                </ul>
              </div>

              {/* 3. Customer Care */}
              <div>
                <h4 className="font-bold text-sm text-black mb-4">CUSTOMER CARE</h4>
                <ul className="space-y-3">
                  <li><Link href="/" className="hover:text-black">Contact us</Link></li>
                  <li><Link href="/" className="hover:text-black">Payment Method</Link></li>
                  <li><Link href="/" className="hover:text-black">Bonus Point</Link></li>
                  <li><Link href="/" className="hover:text-black">FAQ</Link></li>
                </ul>
              </div>
          </div>

          {/* Right Column: Socials & Subscriptions */}
          <div className="lg:w-[500px] flex flex-col gap-8">
             
             {/* Find Us + App */}
             <div className="flex gap-16">
                 <div>
                    <h4 className="font-bold text-xs text-black mb-4 uppercase">Find us on</h4>
                    <div className="flex gap-4">
                       <Link href="/" className="hover:opacity-75"><Facebook size={24} color="#000" strokeWidth={1} fill="#000" fillOpacity={0.1} /></Link>
                       <Link href="/" className="hover:opacity-75"><Instagram size={24} color="#000" /></Link>
                       <Link href="/" className="hover:opacity-75"><Twitter size={24} color="#000" fill="#000" /></Link>
                       <Link href="/" className="hover:opacity-75"><Youtube size={24} color="#000" fill="#000" /></Link>
                       <Link href="/" className="hover:opacity-75"><Linkedin size={24} color="#000" fill="#000" /></Link>
                    </div>
                 </div>

                 <div>
                    <h4 className="font-bold text-xs text-black mb-4 uppercase">App</h4>
                     <div className="flex gap-4 text-black">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.498 13.913c-.027-2.678 2.185-3.965 2.284-4.026-1.246-1.815-3.185-2.062-3.87-2.093-1.636-.166-3.197.962-4.032.962-.832 0-2.126-.938-3.488-.913-1.795.027-3.447 1.045-4.37 2.652-1.865 3.237-.476 8.033 1.34 10.655.888 1.284 1.944 2.703 3.328 2.653 1.334-.053 1.838-.863 3.447-.863 1.61 0 2.068.863 3.472.837 1.434-.026 2.345-1.309 3.224-2.597.994-1.458 1.405-2.872 1.43-2.945-.031-.013-2.731-1.048-2.766-4.322zM12.834 5.346c.883-1.066 1.48-2.552 1.317-4.032-1.272.052-2.815.847-3.729 1.914-.817.947-1.532 2.47-1.339 3.93 1.417.11 2.861-.741 3.751-1.812z"/></svg>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.562 15.658c0 .247.031.433.093.587l2.844-3.555-3.23-3.693c-.155.278-.231.68-.231 1.205v5.456zm12.39-4.836L19.53 7.23c.325.324.495.787.495 1.39l.016 7.416c0 .417-.078.788-.232 1.112l-3.856-4.327zM7.16 12.895l4.326 5.407 1.205-1.514-6.042-6.78-3.924 4.465c.247.34.726.541 1.406.541.48 0 .84-.077 1.096-.232l1.933-1.887zm6.75-2.518l-1.36-1.514-4.88-5.468c-.37-.417-.896-.633-1.576-.633-.556 0-1.004.14-1.33.418l-2.023 2.317 11.17 4.88z"/></svg>
                     </div>
                 </div>
             </div>

             {/* Sign Up Section */}
             <div>
                <h4 className="font-bold text-sm text-black mb-4">SIGN UP FOR SHEIN STYLE NEWS</h4>
                
                {/* Email Input */}
                <div className="flex mb-3">
                   <div className="flex-1 bg-white border border-gray-200 h-10 px-3 flex items-center">
                       <input type="email" placeholder="Your Email Address" className="w-full text-sm outline-none placeholder:text-gray-400" />
                   </div>
                   <button className="bg-black text-white px-8 text-sm font-bold uppercase h-10 hover:bg-gray-800 transition-colors">Subscribe</button>
                </div>

                {/* Phone Input */}
                 <div className="flex mb-3">
                   <div className="w-24 bg-white border border-gray-200 border-r-0 h-10 px-2 flex items-center justify-between text-sm text-gray-500 cursor-pointer">
                       UZ +998 <Info size={12} />
                   </div>
                   <div className="flex-1 bg-white border border-gray-200 h-10 px-3 flex items-center">
                       <input type="text" placeholder="Your phone number for SMS" className="w-full text-sm outline-none placeholder:text-gray-400" />
                   </div>
                   <button className="bg-black text-white px-8 text-sm font-bold uppercase h-10 hover:bg-gray-800 transition-colors">Subscribe</button>
                </div>

                {/* Whatsapp Input */}
                 <div className="flex mb-4">
                    <div className="w-24 bg-white border border-gray-200 border-r-0 h-10 px-2 flex items-center justify-between text-sm text-gray-500 cursor-pointer">
                       UZ +998 <Info size={12} />
                   </div>
                   <div className="flex-1 bg-white border border-gray-200 h-10 px-3 flex items-center">
                       <input type="text" placeholder="WhatsApp Account" className="w-full text-sm outline-none placeholder:text-gray-400" />
                   </div>
                   <button className="bg-black text-white px-8 text-sm font-bold uppercase h-10 hover:bg-gray-800 transition-colors">Subscribe</button>
                </div>

                <p className="text-[10px] text-gray-500">By clicking the SUBSCRIBE button, you are agreeing to our <Link href="/" className="text-blue-600">Privacy & Cookie Policy</Link></p>
             </div>

          </div>

        </div>

        {/* Payments & Legal */}
        <div className="pt-8 flex flex-col items-center lg:items-start gap-8">
            
            <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-8">
                 {/* Empty left side or additional links could go here */}
                 
                 {/* Payments */}
                 <div className="lg:ml-auto">
                    <h4 className="font-bold text-sm mb-4">WE ACCEPT</h4>
                     <div className="flex flex-wrap gap-2 opacity-100">
                        {/* Recreating Payment Icons with minimal CSS to look like images */}
                        <div className="h-6 px-2 bg-[#1A1F71] rounded flex items-center justify-center text-[10px] text-white font-black italic tracking-tighter">VISA</div>
                        <div className="h-6 px-2 bg-[#EB001B] rounded flex items-center justify-center">
                             <div className="flex -space-x-2">
                                 <div className="w-3 h-3 rounded-full bg-[#EB001B]"></div>
                                 <div className="w-3 h-3 rounded-full bg-[#F79E1B]"></div>
                             </div>
                        </div>
                        <div className="h-6 px-2 bg-[#006FCF] rounded flex items-center justify-center text-[8px] text-white font-bold">AME<span className="text-[#fff]">X</span></div>
                        <div className="h-6 px-2 bg-[#003087] rounded flex items-center justify-center text-[10px] text-white font-bold italic">PayPal</div>
                        <div className="h-6 px-2 bg-black rounded flex items-center justify-center text-[10px] text-white font-bold"><span className="text-white mr-0.5">G</span>Pay</div>
                        <div className="h-6 px-2 bg-white border border-gray-300 rounded flex items-center justify-center text-[10px] text-black font-bold">Apple Pay</div>
                        <div className="h-6 px-2 bg-[#004094] rounded flex items-center justify-center text-[8px] text-white font-bold">S<span className="text-[#FFB81C]">K</span>RILL</div>
                        <div className="h-6 px-2 bg-[#d7000f] rounded flex items-center justify-center text-[8px] text-white font-bold">Maestro</div>
                    </div>
                 </div>
            </div>

             <div className="w-full flex flex-col-reverse md:flex-row justify-between items-center text-[11px] text-gray-500 gap-4 mt-8">
                <p>©2009-2026 SHEIN All Rights Reserved</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    <Link href="/" className="hover:text-black">Privacy Center</Link>
                    <Link href="/" className="border-l border-gray-300 pl-6 hover:text-black">Privacy & Cookie Policy</Link>
                    <Link href="/" className="border-l border-gray-300 pl-6 hover:text-black">Manage Cookies</Link>
                    <Link href="/" className="border-l border-gray-300 pl-6 hover:text-black">Terms & Conditions</Link>
                    <Link href="/" className="border-l border-gray-300 pl-6 hover:text-black">Marketplace IP Rules</Link>
                    <Link href="/" className="border-l border-gray-300 pl-6 hover:text-black">Imprint</Link>
                </div>
                <div className="flex items-center gap-1 font-bold text-black border-l border-gray-300 pl-4">
                    Pakistan
                </div>
             </div>

        </div>

      </div>
    </footer>
  );
}
