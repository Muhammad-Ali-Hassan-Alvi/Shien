import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import PasswordReset from "@/app/lib/model/PasswordReset";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;

export async function POST(req) {
    try {
        const { email, code, password } = await req.json();
        const normalized = String(email || "").trim().toLowerCase();
        const rawCode = String(code || "").trim();

        if (!normalized || !rawCode || !password) {
            return NextResponse.json({ error: "Email, code, and new password are required." }, { status: 400 });
        }

        if (!/^\d{4}$/.test(rawCode)) {
            return NextResponse.json({ error: "Code must be exactly 4 digits." }, { status: 400 });
        }

        if (String(password).length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
        }

        await connectDB();

        const reset = await PasswordReset.findOne({ email: normalized }).sort({ createdAt: -1 });
        if (!reset || reset.expiresAt < new Date()) {
            return NextResponse.json({ error: "Code expired or invalid. Request a new one." }, { status: 400 });
        }

        if (reset.attempts >= MAX_ATTEMPTS) {
            await PasswordReset.deleteMany({ email: normalized });
            return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
        }

        const codeMatch = await bcrypt.compare(rawCode, reset.codeHash);
        reset.attempts += 1;
        await reset.save();

        if (!codeMatch) {
            return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
        }

        const user = await User.findOne({ email: normalized });
        if (!user) {
            return NextResponse.json({ error: "Account not found." }, { status: 404 });
        }

        user.password = await bcrypt.hash(String(password), 10);
        await user.save();
        await PasswordReset.deleteMany({ email: normalized });

        return NextResponse.json({
            success: true,
            message: "Password updated. You can sign in now.",
        });
    } catch (error) {
        console.error("[reset-password]", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
