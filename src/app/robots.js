const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000";

export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/seller-center/", "/api/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
