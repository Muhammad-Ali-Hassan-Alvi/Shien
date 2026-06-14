import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import Category from "@/app/lib/model/Category";
import ProductView from "@/components/ProductView";
import { notFound } from "next/navigation";
import {
    buildCategoryTree,
    flattenCategoriesFlat,
    resolveEffectiveVariantSettings,
    isCategoryVisibleInShop,
} from "@/app/lib/categoryUtils";
import { getShopCategoryTree } from "@/app/lib/shopCategories";

// Fetch data logic - return a plain object (no ObjectId/buffer) for Client Components
async function getProduct(slug) {
    await connectDB();
    const product = await Product.findOne({ slug, isArchived: { $ne: true } }).lean();
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

    const categoryTree = await getShopCategoryTree();
    if (!isCategoryVisibleInShop(categoryTree, category)) return [];

    const related = await Product.find({
        category: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        _id: { $ne: excludeId },
        isArchived: { $ne: true },
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

    const categoryTree = await getShopCategoryTree();
    if (product.category && !isCategoryVisibleInShop(categoryTree, product.category)) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(
        product.category,
        product._id,
        4
    );

    const categories = await Category.find({}).lean();
    const adminCategoryTree = buildCategoryTree(categories);
    const flatCategories = flattenCategoriesFlat(adminCategoryTree);
    const variantConfig = resolveEffectiveVariantSettings(flatCategories, product.category);

    return (
        <ProductView
            product={product}
            relatedProducts={relatedProducts}
            variantConfig={variantConfig}
        />
    );
}
