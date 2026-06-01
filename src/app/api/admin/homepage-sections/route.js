import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import { getHomepageFeaturedDoc, MAX_ITEMS } from "@/app/lib/homepageFeatured";
import { requireAdmin } from "@/app/lib/requireAdmin";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function populateProducts(ids) {
    if (!ids?.length) return [];
    const products = await Product.find({
        _id: { $in: ids },
        isArchived: { $ne: true },
    })
        .select("name slug images pricing")
        .lean();

    const map = new Map(products.map((p) => [String(p._id), p]));
    return ids.map((id) => map.get(String(id))).filter(Boolean);
}

export async function GET() {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const doc = await getHomepageFeaturedDoc();

        const flashSaleProducts = await populateProducts(doc.flashSaleProducts);
        const hotDropProducts = await populateProducts(doc.hotDropProducts);

        return NextResponse.json({
            flashSaleProducts,
            hotDropProducts,
            flashSaleEndsAt: doc.flashSaleEndsAt || null,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const body = await req.json();
        const { flashSaleProductIds, hotDropProductIds, flashSaleEndsAt } = body;

        const flashIds = (flashSaleProductIds || []).slice(0, MAX_ITEMS);
        const hotIds = (hotDropProductIds || []).slice(0, MAX_ITEMS);

        const allIds = [...new Set([...flashIds, ...hotIds].map(String))];
        if (allIds.length > 0) {
            const count = await Product.countDocuments({
                _id: { $in: allIds },
                isArchived: { $ne: true },
            });
            if (count !== allIds.length) {
                return NextResponse.json({ error: "One or more products not found" }, { status: 400 });
            }
        }

        const doc = await getHomepageFeaturedDoc();
        doc.flashSaleProducts = flashIds;
        doc.hotDropProducts = hotIds;
        doc.flashSaleEndsAt = flashSaleEndsAt ? new Date(flashSaleEndsAt) : null;
        await doc.save();

        const flashSaleProducts = await populateProducts(doc.flashSaleProducts);
        const hotDropProducts = await populateProducts(doc.hotDropProducts);

        revalidatePath("/");

        return NextResponse.json({
            success: true,
            flashSaleProducts,
            hotDropProducts,
            flashSaleEndsAt: doc.flashSaleEndsAt,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
