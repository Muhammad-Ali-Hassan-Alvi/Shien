"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ServiceBar from "@/components/ServiceBar";
import BottomNav from "@/components/BottomNav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from "next-auth/react";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/seller-center");

  return (
    <SessionProvider>
      {!isAdmin && <ServiceBar />}
      {!isAdmin && <Navbar />}
      
      <main className={`min-h-screen ${!isAdmin ? "pb-16 md:pb-0" : ""}`}>
        {children}
      </main>

      {!isAdmin && <Footer />}
      {!isAdmin && <BottomNav />}
      
      {!isAdmin && <CartDrawer />}
      
      <Toaster
          position="bottom-right"
          toastOptions={{
            className: '!bg-white/70 !backdrop-blur-xl !shadow-2xl !border !border-white/20 !rounded-2xl !text-gray-900', 
            style: {
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(16px)',
              color: '#000',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.5)',
              padding: '12px 20px',
              fontFamily: 'var(--font-mulish)',
              fontWeight: 600,
            },
            success: {
              iconTheme: {
                primary: '#000',
                secondary: '#e5e7eb',
              },
            },
            error: {
               iconTheme: {
                primary: '#ef4444',
                secondary: '#ffe4e6',
               }
            }
          }}
        />
    </SessionProvider>
  );
}
