import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import ProductView from "@/components/ProductView";
import { notFound } from "next/navigation";

// Fetch data logic - return a plain object (no ObjectId/buffer) for Client Components
async function getProduct(slug) {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return null;

    // Convert to plain object so it can be passed to Client Components (no toJSON/buffer)
    return {
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt?.toISOString?.() ?? null,
        updatedAt: product.updatedAt?.toISOString?.() ?? null,
        // Mongoose adds _id to each variant subdocument - must serialize for client
        variants: (product.variants ?? []).map((v) => ({
            color: v.color,
            size: v.size,
            stock: v.stock ?? 0,
            ...(v._id != null && { _id: v._id.toString() }),
        })),
    };
}

// SEO Metadata
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return { title: 'Product Not Found' };
    }

    return {
        title: `${product.name} | iMART`,
        description: product.description,
        openGraph: {
            images: product.images,
        }
    };
}

async function getRelatedProducts(category, excludeId, limit = 4) {
    if (!category) return [];
    await connectDB();
    const related = await Product.find({
        category,
        _id: { $ne: excludeId },
    })
        .limit(limit)
        .lean();

    return related.map((p) => ({
        ...p,
        _id: p._id.toString(),
    }));
}

export default async function ProductPage({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(
        product.category,
        product._id,
        4
    );

    return <ProductView product={product} relatedProducts={relatedProducts} />;
}
