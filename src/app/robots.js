import { getAppBaseUrl } from "@/app/lib/siteUrl";

const baseUrl = getAppBaseUrl();

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
