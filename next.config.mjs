/** @type {import('next').NextConfig} */

function resolveAppUrl() {
  const explicit = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
    process.env.SITE_URL,
  ].find((v) => v && !/localhost|127\.0\.0\.1/i.test(v));

  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  return (process.env.AUTH_URL || process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

const appUrl = resolveAppUrl();

const nextConfig = {
  env: {
    AUTH_URL: appUrl,
    NEXTAUTH_URL: appUrl,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || appUrl,
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
