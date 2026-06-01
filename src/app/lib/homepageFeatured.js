import connectDB from "@/app/lib/config/db";
import HomepageFeatured from "@/app/lib/model/HomepageFeatured";
import Product from "@/app/lib/model/Product";

const FEATURED_KEY = "main";
const MAX_ITEMS = 3;

function orderProducts(ids, products) {
    const map = new Map(products.map((p) => [String(p._id), p]));
    return ids.map((id) => map.get(String(id))).filter(Boolean).slice(0, MAX_ITEMS);
}

export async function getHomepageFeaturedDoc() {
    await connectDB();
    let doc = await HomepageFeatured.findOne({ key: FEATURED_KEY });
    if (!doc) {
        doc = await HomepageFeatured.create({ key: FEATURED_KEY });
    }
    return doc;
}

export async function getHomepageFeaturedProducts({ skipConnect = false } = {}) {
    if (!skipConnect) {
        await connectDB();
    }
    const doc = await HomepageFeatured.findOne({ key: FEATURED_KEY }).lean();

    if (!doc) {
        return { flashSale: [], hotDrops: [], flashSaleEndsAt: null };
    }

    const flashIds = (doc.flashSaleProducts || []).slice(0, MAX_ITEMS);
    const hotIds = (doc.hotDropProducts || []).slice(0, MAX_ITEMS);
    const allIds = [...new Set([...flashIds.map(String), ...hotIds.map(String)])];

    if (allIds.length === 0) {
        return {
            flashSale: [],
            hotDrops: [],
            flashSaleEndsAt: doc.flashSaleEndsAt || null,
        };
    }

    const products = await Product.find({
        _id: { $in: allIds },
        isArchived: { $ne: true },
    }).lean();

    return {
        flashSale: orderProducts(flashIds, products),
        hotDrops: orderProducts(hotIds, products),
        flashSaleEndsAt: doc.flashSaleEndsAt || null,
    };
}

export { MAX_ITEMS };
