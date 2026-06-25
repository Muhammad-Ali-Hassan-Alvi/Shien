/** @type {import('next').NextConfig} */
import { resolveSiteUrls } from "./src/app/lib/siteUrl.js";

const { siteUrl, appUrl, authUrl, nextAuthUrl } = resolveSiteUrls();

const nextConfig = {
  env: {
    AUTH_URL: authUrl,
    NEXTAUTH_URL: nextAuthUrl,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || siteUrl,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || appUrl,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img.ltwebstatic.com',
      },
    ],
  },
};

export default nextConfig;
