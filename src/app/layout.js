import { Inter, Playfair_Display, Mulish } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

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
        className={`${inter.variable} ${playfair.variable} ${mulish.variable} font-sans antialiased text-black relative min-h-screen`}
        suppressHydrationWarning={true}
      >
        <div className="mesh-bg">
          <div className="mesh-blob blob-1"></div>
          <div className="mesh-blob blob-2"></div>
          <div className="mesh-blob blob-3"></div>
        </div>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
