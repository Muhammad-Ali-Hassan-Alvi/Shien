import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";

const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000";

export default async function sitemap() {
    const staticRoutes = [
        "",
        "/products",
        "/about",
        "/shipping",
        "/returns",
        "/help-center",
        "/payments",
        "/legal/privacy",
        "/legal/terms",
    ].map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
    }));

    let productRoutes = [];
    try {
        await connectDB();
        const products = await Product.find({}).select("slug updatedAt").lean();
        productRoutes = products.map((p) => ({
            url: `${baseUrl}/product/${p.slug}`,
            lastModified: p.updatedAt || new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        }));
    } catch (e) {
        console.error("[sitemap] Failed to load products:", e.message);
    }

    return [...staticRoutes, ...productRoutes];
}
