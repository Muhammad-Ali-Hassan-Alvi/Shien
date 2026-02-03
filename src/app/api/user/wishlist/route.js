import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/user";
import Product from "@/app/lib/model/Product"; // Ensure model is registered
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { productId } = await req.json();
        await connectDB();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Toggle Logic
        const index = user.wishlist.indexOf(productId);
        if (index === -1) {
            user.wishlist.push(productId);
        } else {
            user.wishlist.splice(index, 1);
        }

        await user.save();

        return NextResponse.json({ message: "Wishlist updated", wishlist: user.wishlist });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ wishlist: [] });
        }

        await connectDB();
        // Populate wishlist
        const user = await User.findById(session.user.id).populate('wishlist').lean();

        return NextResponse.json({ wishlist: user?.wishlist || [] });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
