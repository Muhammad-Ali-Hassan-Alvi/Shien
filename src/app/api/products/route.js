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

        const query = {};
        if (category) query.category = new RegExp(category, 'i');

        let sortOption = { createdAt: -1, _id: -1 };
        if (sort === 'bestsellers') sortOption = { "pricing.salePrice": 1, _id: -1 };
        if (sort === 'new') sortOption = { createdAt: -1, _id: -1 };
        if (sort === 'price_asc') sortOption = { "pricing.salePrice": 1, _id: -1 };
        if (sort === 'price_desc') sortOption = { "pricing.salePrice": -1, _id: -1 };

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query); // Fixed count query
        const hasMore = total > skip + products.length;

        return NextResponse.json({
            products,
            hasMore,
            page,
            total
        });

    } catch (error) {
        console.error("Fetch Products Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        if (!body.name || !body.slug) {
            return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
        }

        const existing = await Product.findOne({ slug: body.slug });
        if (existing) {
            return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 });
        }

        const newProduct = new Product(body);
        await newProduct.save();

        return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await Product.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
