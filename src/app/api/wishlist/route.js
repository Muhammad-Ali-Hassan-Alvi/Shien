import connectDB from "@/app/lib/config/db";
import Wishlist from "@/app/lib/model/Wishlist";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ wishlist: [] });
        }

        await connectDB();

        // Fetch Wishlist Items & Populate Product
        const wishlistItems = await Wishlist.find({ user: session.user.id })
            .populate({
                path: 'product',
                select: 'name slug images pricing' // Only fetch needed fields
            })
            .sort({ createdAt: -1 })
            .lean();

        // Filter out items where product might have been deleted
        const validItems = wishlistItems
            .filter(item => item.product)
            .map(item => item.product);

        return NextResponse.json({ wishlist: validItems });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = await req.json();
        await connectDB();

        // Transactional toggle or simple check? Simple check is fine for wishlist
        const existing = await Wishlist.findOne({
            user: session.user.id,
            product: productId
        });

        if (existing) {
            await Wishlist.deleteOne({ _id: existing._id });
            return NextResponse.json({ message: "Removed from wishlist", active: false });
        } else {
            await Wishlist.create({
                user: session.user.id,
                product: productId
            });
            return NextResponse.json({ message: "Added to wishlist", active: true });
        }

    } catch (error) {
        // Handle unique index error explicitly?
        if (error.code === 11000) {
            return NextResponse.json({ message: "Already in wishlist" }, { status: 200 }); // Robustness
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
