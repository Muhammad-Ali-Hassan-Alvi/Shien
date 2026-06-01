import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import PasswordReset from "@/app/lib/model/PasswordReset";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendPasswordResetCodeEmail } from "@/services/EmailService";

const CODE_TTL_MS = 15 * 60 * 1000;

function generateCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(req) {
    try {
        const { email } = await req.json();
        const normalized = String(email || "").trim().toLowerCase();

        if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: normalized }).select("name email").lean();

        if (user) {
            const code = generateCode();
            const codeHash = await bcrypt.hash(code, 10);
            const expiresAt = new Date(Date.now() + CODE_TTL_MS);

            await PasswordReset.deleteMany({ email: normalized });
            await PasswordReset.create({ email: normalized, codeHash, expiresAt });

            const emailResult = await sendPasswordResetCodeEmail({
                to: normalized,
                userName: user.name,
                code,
            });

            if (!emailResult.sent) {
                await PasswordReset.deleteMany({ email: normalized });
                return NextResponse.json(
                    {
                        error:
                            "Could not send reset email. Check SMTP settings or try again later.",
                    },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            message:
                "If an account exists for this email, a 4-digit code has been sent. Check your inbox and spam folder.",
        });
    } catch (error) {
        console.error("[forgot-password]", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
