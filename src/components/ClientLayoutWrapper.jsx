"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ServiceBar from "@/components/ServiceBar";
import BottomNav from "@/components/BottomNav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { Toaster } from 'react-hot-toast';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  // Check if we are in the admin dashboard (seller-center) OR auth pages (login/register) 
  // User said "remove footer for admin", but usually auth pages also don't need full footer/nav? 
  // Let's stick strictly to "admin" for now as requested, but maybe exclude auth/login if it looks weird.
  // User request: "remove the footer for admin And the navbar also"
  
  const isAdmin = pathname?.startsWith("/seller-center");
  // Optional: Also hide on login page? User didn't ask, but it's cleaner. 
  // Let's stick to user request.

  return (
    <>
      {!isAdmin && <ServiceBar />}
      {!isAdmin && <Navbar />}
      
      <main className={`min-h-screen ${!isAdmin ? "pb-16 md:pb-0" : ""}`}>
        {children}
      </main>

      {!isAdmin && <Footer />}
      {!isAdmin && <BottomNav />}
      
      {/* Drawer and Toaster can be global, or Drawer hidden on admin */}
      {!isAdmin && <CartDrawer />}
      
      <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#000',
              color: '#fff',
              borderRadius: '0px',
              border: '1px solid #333',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#fff',
                secondary: '#000',
              },
            },
          }}
        />
    </>
  );
}
