import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import { buildSaleQuery } from "@/app/lib/productUtils";
import { getHomepageFeaturedProducts } from "@/app/lib/homepageFeatured";
import ProductGrid from "@/components/ProductGrid";
import CategoryIcons from "@/components/CategoryIcons";
import SuperDeals from "@/components/SuperDeals";
import Hero from "@/components/Hero";
import Link from "next/link";

async function getInitialProducts(searchParams) {
    await connectDB();
    const resolvedParams = await searchParams;
    const { category, sort } = resolvedParams || {};

    const query = {};
    if (category) query.category = new RegExp(category, "i");

    let sortOption = { createdAt: -1 };
    if (sort === "bestsellers") sortOption = { reviewCount: -1, averageRating: -1, createdAt: -1 };
    if (sort === "sale") Object.assign(query, buildSaleQuery());
    if (sort === "price_asc") sortOption = { "pricing.salePrice": 1 };
    if (sort === "price_desc") sortOption = { "pricing.salePrice": -1 };

    const [mainProducts, featured] = await Promise.all([
        Product.find(query).sort(sortOption).limit(10).lean(),
        getHomepageFeaturedProducts({ skipConnect: true }),
    ]);

    const serialize = (data) => JSON.parse(JSON.stringify(data));

    return {
        mainProducts: serialize(mainProducts),
        hotDrops: serialize(featured.hotDrops),
        flashSale: serialize(featured.flashSale),
        flashSaleEndsAt: featured.flashSaleEndsAt
            ? new Date(featured.flashSaleEndsAt).toISOString()
            : null,
    };
}

export const metadata = {
    title: "iMART | High-End Fashion",
};

export default async function HomePage({ searchParams }) {
    const { mainProducts, hotDrops, flashSale, flashSaleEndsAt } =
        await getInitialProducts(searchParams);

    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <CategoryIcons />

            <SuperDeals
                hotDrops={hotDrops}
                flashSale={flashSale}
                flashSaleEndsAt={flashSaleEndsAt}
            />

            <div id="shop" className="max-w-7xl mx-auto px-4 md:px-12 py-12">
                <ProductGrid initialProducts={mainProducts} />

                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/products"
                        className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
                    >
                        View All Products
                    </Link>
                </div>
            </div>
        </div>
    );
}
