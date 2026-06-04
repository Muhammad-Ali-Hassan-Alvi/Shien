"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { fetchAndSetWishlist } from "@/app/lib/wishlistHydrate";
import Navbar from "@/components/Navbar";
import ServiceBar from "@/components/ServiceBar";
import BottomNav from "@/components/BottomNav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/context/SocketProvider";
import CartHydrator from "@/components/CartHydrator";

function WishlistHydrator({ isAdmin }) {
  const { status } = useSession();
  const setWishlist = useWishlistStore((s) => s.setWishlist);

  useEffect(() => {
    if (!isAdmin && status === "authenticated") {
      fetchAndSetWishlist(setWishlist);
    }
  }, [isAdmin, status, setWishlist]);

  return null;
}

export default function ClientLayoutWrapper({ children, session }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/seller-center");

  return (
    <SessionProvider session={session}>
      <SocketProvider>
      <CartHydrator />
      <WishlistHydrator isAdmin={isAdmin} />
      {!isAdmin && <ServiceBar />}
      {!isAdmin && <Navbar />}
      
      <main className={`min-h-screen overflow-x-hidden ${!isAdmin ? "pb-[4.5rem] md:pb-0" : ""}`}>
        {children}
      </main>

      {!isAdmin && <Footer />}
      {!isAdmin && (
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      )}
      
      {!isAdmin && <CartDrawer />}
      
      <Toaster
          position="bottom-right"
          toastOptions={{
            className: '!bg-white/70 !backdrop-blur-xl !shadow-2xl !border !border-white/20 !rounded-2xl !text-gray-900 !mb-20 md:!mb-0', 
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
      </SocketProvider>
    </SessionProvider>
  );
}
