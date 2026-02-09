import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-poppins"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

import { auth } from "@/auth";

export const metadata = {
  title: "iMART | High-End Fashion",
  description: "Premium Fashion for Pakistan",
};

export default async function RootLayout({ children }) {
  let session = await auth();

  // Safeguard: If auth returns an error object, sanitize it to null
  if (session?.error) {
    console.error("Session Error detected:", session.error);
    session = null;
  }

  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${playfair.variable} font-sans antialiased text-black relative min-h-screen`}
        suppressHydrationWarning={true}
      >
        <div className="mesh-bg">
          <div className="mesh-blob blob-1"></div>
          <div className="mesh-blob blob-2"></div>
          <div className="mesh-blob blob-3"></div>
        </div>
        <ClientLayoutWrapper session={session}>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
