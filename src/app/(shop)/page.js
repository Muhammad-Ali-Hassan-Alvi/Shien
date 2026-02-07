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
    const resolvedParams = await searchParams;
    const { category, sort } = resolvedParams || {};

    const query = {};
    if (category) query.category = new RegExp(category, 'i');

    let sortOption = { createdAt: -1 };
    if (sort === 'bestsellers') sortOption = { "pricing.salePrice": 1 };
    if (sort === 'price_asc') sortOption = { "pricing.salePrice": 1 };
    if (sort === 'price_desc') sortOption = { "pricing.salePrice": -1 };

    // 1. Main Grid Products (10)
    const mainProducts = await Product.find(query).sort(sortOption).limit(10).lean();

    // 2. Hot Drops (Newest 3)
    const hotDrops = await Product.find({}).sort({ createdAt: -1 }).limit(3).lean();

    // 3. Flash Sale (Random or Highly Discounted - for now picking 3 random or filtered)
    // Using simple find for speed, ideally aggregate for discount size
    const flashSale = await Product.find({ "pricing.salePrice": { $lt: 2000 } }).limit(3).lean();

    const serialize = (data) => JSON.parse(JSON.stringify(data));

    return {
        mainProducts: serialize(mainProducts),
        hotDrops: serialize(hotDrops),
        flashSale: serialize(flashSale)
    };
}

export const metadata = {
    title: "iMART | High-End Fashion",
};

export default async function HomePage({ searchParams }) {
    const { mainProducts, hotDrops, flashSale } = await getInitialProducts(searchParams);

    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <CategoryIcons />

            {/* Pass Real Data to SuperDeals */}
            <SuperDeals hotDrops={hotDrops} flashSale={flashSale} />

            {/* Main Shop Area */}
            <div id="shop" className="max-w-7xl mx-auto px-4 md:px-12 py-12">
                <ProductGrid initialProducts={mainProducts} />

                <div className="mt-8 text-center md:hidden">
                    <Link href="/products" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
                        View All Products
                    </Link>
                </div>
            </div>
        </div>
    );
}
