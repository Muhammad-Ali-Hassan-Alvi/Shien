import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

/** Unified wishlist API — uses embedded User.wishlist (same as /api/user/wishlist). */

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ wishlist: [] });
        }

        await connectDB();
        const user = await User.findById(session.user.id).populate("wishlist").lean();

        return NextResponse.json({ wishlist: user?.wishlist || [] });
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

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const idStr = productId.toString();
        const index = user.wishlist.findIndex((w) => w.toString() === idStr);
        if (index === -1) {
            user.wishlist.push(productId);
            await user.save();
            return NextResponse.json({ message: "Added to wishlist", active: true });
        }

        user.wishlist.splice(index, 1);
        await user.save();
        return NextResponse.json({ message: "Removed from wishlist", active: false });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
