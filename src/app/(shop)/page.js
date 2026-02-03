import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import ProductGrid from "@/components/ProductGrid";
import CategoryIcons from "@/components/CategoryIcons";
import SuperDeals from "@/components/SuperDeals";
import Hero from "@/components/Hero";
import Link from "next/link";

// Server Component (Data Fetching)
async function getInitialProducts(searchParams) {
    await connectDB();
    const { category, sort } = await searchParams; // Await searchParams in Next.js 15+

    const query = {};
    if (category) query.category = new RegExp(category, 'i'); // Case insensitive

    let sortOption = { createdAt: -1 };
    if (sort === 'bestsellers') sortOption = { "pricing.salePrice": 1 }; // Placeholder for "Hot"
    if (sort === 'price_asc') sortOption = { "pricing.salePrice": 1 };
    if (sort === 'price_desc') sortOption = { "pricing.salePrice": -1 };

    // Fetch first 10
    const products = await Product.find(query).sort(sortOption).limit(10).lean();

    // Deeply serialize using JSON parse/stringify to handle all nested _id and Date objects
    return JSON.parse(JSON.stringify(products));
}

export const metadata = {
    title: "Shein.PK | Women's Fashion",
};

export default async function HomePage({ searchParams }) {
    const initialProducts = await getInitialProducts(searchParams);
    // ... rest of component

    return (
        <div className="min-h-screen bg-white">
            {/* Categories Marquee (Polish) */}
            {/* <div className="bg-red-600 text-white py-1 overflow-hidden whitespace-nowrap text-xs">
                <div className="inline-block animate-marquee">
                    <span className="mx-4 font-bold uppercase">Free Shipping on orders rs. 5000+</span>
                    <span className="mx-4 font-bold uppercase">•</span>
                    <span className="mx-4 font-bold uppercase">Cash on Delivery Available</span>
                </div>
            </div> */}

            <Hero />

            {/* Categories Marquee (Optional Polish) */}
            {/* <div className="bg-red-600 text-white py-1 overflow-hidden whitespace-nowrap text-xs">
                <div className="inline-block animate-marquee">
                    <span className="mx-4 font-bold uppercase">Free Shipping on orders rs. 5000+</span>
                    <span className="mx-4 font-bold uppercase">•</span>
                    <span className="mx-4 font-bold uppercase">Cash on Delivery Available</span>
                </div>
            </div> */}

            <CategoryIcons />
            <SuperDeals />

            {/* Main Shop Area */}
            <div id="shop" className="max-w-7xl mx-auto px-4 md:px-12 py-12">
                <ProductGrid initialProducts={initialProducts} />
            </div>
        </div>
    );
}
