import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const category = searchParams.get("category");
        const sort = searchParams.get("sort");

        const skip = (page - 1) * limit;

        // Build Query
        const query = {};
        if (category) query.category = new RegExp(category, 'i');

        // Build Sort
        let sortOption = { createdAt: -1, _id: -1 };
        if (sort === 'bestsellers') sortOption = { "pricing.salePrice": 1, _id: -1 }; // Placeholder
        if (sort === 'new') sortOption = { createdAt: -1, _id: -1 };
        if (sort === 'price_asc') sortOption = { "pricing.salePrice": 1, _id: -1 };
        if (sort === 'price_desc') sortOption = { "pricing.salePrice": -1, _id: -1 };

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        // Check if there are more
        const total = await Product.countDocuments();
        const hasMore = total > skip + products.length;

        return NextResponse.json({
            products,
            hasMore,
            page,
            total
        });

    } catch (error) {
        console.error("Fetch Products Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
