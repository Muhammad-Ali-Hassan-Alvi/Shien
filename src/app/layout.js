import { Inter, Playfair_Display, Mulish } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ServiceBar from "@/components/ServiceBar";
import CartDrawer from "@/components/CartDrawer";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const mulish = Mulish({ subsets: ["latin"], variable: "--font-mulish" });

export const metadata = {
  title: "Shein.PK | High-End Fashion",
  description: "Premium Fashion for Pakistan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${mulish.variable} font-sans antialiased text-black`}
        style={{ backgroundColor: "#F7F5F2" }}
        suppressHydrationWarning={true}
      >
        <ServiceBar />
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <CartDrawer />
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
      </body>
    </html>
  );
}
