import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import User from "@/app/lib/model/User";
import Notification from "@/app/lib/model/Notification";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        // Single Product Fetch
        if (id) {
            const product = await Product.findById(id).lean();
            if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

            // Add wishlist count for single product
            const wishlistCount = await User.countDocuments({ wishlist: id });
            return NextResponse.json({ product: { ...product, wishlistCount } });
        }

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const category = searchParams.get("category");
        const sort = searchParams.get("sort");
        const includeStats = searchParams.get("includeStats"); // Flag for admin

        const search = searchParams.get("search");

        const skip = (page - 1) * limit;

        const query = {};
        if (category) query.category = new RegExp(category, 'i');
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1, _id: -1 };
        if (sort === 'bestsellers') sortOption = { "pricing.salePrice": 1, _id: -1 };
        if (sort === 'new') sortOption = { createdAt: -1, _id: -1 };
        if (sort === 'price_asc') sortOption = { "pricing.salePrice": 1, _id: -1 };
        if (sort === 'price_desc') sortOption = { "pricing.salePrice": -1, _id: -1 };

        let products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Product.countDocuments(query);
        const hasMore = total > skip + products.length;

        // If admin requests stats (like wishlist count)
        if (includeStats === 'true') {
            const productIds = products.map(p => p._id);

            // Aggregate wishlist counts
            const wishlistCounts = await User.aggregate([
                { $unwind: "$wishlist" },
                { $match: { wishlist: { $in: productIds } } },
                { $group: { _id: "$wishlist", count: { $sum: 1 } } }
            ]);

            const countMap = {};
            wishlistCounts.forEach(w => countMap[w._id.toString()] = w.count);

            products = products.map(p => ({
                ...p,
                wishlistCount: countMap[p._id.toString()] || 0
            }));
        }

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

export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // Get OLD product to check stock
        const oldProduct = await Product.findById(id);
        if (!oldProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        // Calculate old stock (sum of variants or totalStock field if exists - assuming variants approach)
        const oldStock = oldProduct.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

        // Update Product
        const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });

        // Calculate new stock
        const newStock = updatedProduct.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

        // RESTOCK ALERT LOGIC
        // If it was out of stock (<= 0) and now has stock (> 0)
        if (oldStock <= 0 && newStock > 0) {
            // Find users who have this product in their wishlist
            const interestedUsers = await User.find({ wishlist: id });

            if (interestedUsers.length > 0) {
                const notifications = interestedUsers.map(user => ({
                    user: user._id,
                    type: "Restock",
                    message: `Good news! "${updatedProduct.name}" is back in stock!`,
                    link: `/product/${updatedProduct.slug}`,
                    isRead: false
                }));

                await Notification.insertMany(notifications);
                console.log(`Created restock notifications for ${notifications.length} users.`);
            }
        }

        return NextResponse.json({ success: true, product: updatedProduct });

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
