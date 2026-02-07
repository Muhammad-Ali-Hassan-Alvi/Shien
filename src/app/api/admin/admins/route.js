import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();

        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admins = await User.find({ role: 'admin' }).select('-password');

        return NextResponse.json({ admins });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const session = await auth();

        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, email, phone, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'admin',
            wishlist: []
        });

        // Remove password from response
        const { password: _, ...adminWithoutPass } = newAdmin.toObject();

        return NextResponse.json({ success: true, admin: adminWithoutPass }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const session = await auth();

        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // Prevent deleting yourself
        if (id === session.user.id) {
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        await User.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
