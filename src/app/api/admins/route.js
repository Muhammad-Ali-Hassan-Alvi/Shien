import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Admin from "@/app/lib/model/Admin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // 1. Security Check: Verify Super Admin Auth
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: "Unauthorized. Only Admins can create new Admins." },
                { status: 401 }
            );
        }

        // 2. Parse Data
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields (name, email, password)." },
                { status: 400 }
            );
        }

        await connectDB();

        // 3. Check Duplicates
        const existing = await Admin.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { error: "Admin with this email already exists." },
                { status: 409 }
            );
        }

        // 4. Create New Admin
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            isSuperAdmin: false // Default to regular admin
        });

        return NextResponse.json({
            success: true,
            message: "New Admin Created Successfully",
            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Create Admin Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    // Optional: List all admins
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const admins = await Admin.find({}).select("-password").sort({ createdAt: -1 });

        return NextResponse.json({ admins });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
