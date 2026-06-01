import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(session.user.id).select("-password -refreshToken").lean();
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile Fetched Successfully",
            data: { ...user, _id: user._id.toString() },
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectDB();

        const allowed = ["name", "email", "phone", "userName"];
        const update = {};
        for (const key of allowed) {
            if (body[key] !== undefined) update[key] = body[key];
        }

        if (body.password) {
            update.password = await bcrypt.hash(body.password, 10);
        }

        if (update.email) {
            const existing = await User.findOne({
                email: update.email,
                _id: { $ne: session.user.id },
            });
            if (existing) {
                return NextResponse.json({ message: "Email already in use" }, { status: 400 });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(session.user.id, update, {
            new: true,
        }).select("-password -refreshToken");

        return NextResponse.json({
            message: "Profile Updated Successfully",
            data: updatedUser,
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
