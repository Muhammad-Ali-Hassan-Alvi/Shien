import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/config/db";
import Admin from "@/app/lib/model/Admin";
import User from "@/app/lib/model/User";

/** Resolve seller-center access from session role or Admin / User records. */
async function resolveAdminSession(session) {
    if (!session?.user?.id) return null;

    if (session.user.role === "admin") {
        return session;
    }

    await connectDB();

    const email = session.user.email?.trim()?.toLowerCase();
    if (email) {
        const adminDoc = await Admin.findOne({ email }).lean();
        if (adminDoc) {
            return {
                ...session,
                user: { ...session.user, role: "admin" },
            };
        }
    }

    const user = await User.findById(session.user.id).select("role").lean();
    if (user?.role === "admin") {
        return {
            ...session,
            user: { ...session.user, role: "admin" },
        };
    }

    return null;
}

/** Returns session or a 401 NextResponse for route handlers. */
export async function requireAdmin() {
    const session = await auth();
    const adminSession = await resolveAdminSession(session);

    if (!adminSession) {
        return {
            session: null,
            error: NextResponse.json(
                {
                    error: "Unauthorized",
                    hint: "Sign in at /admin/login on this same host (e.g. localhost:5000).",
                },
                { status: 401 }
            ),
        };
    }

    return { session: adminSession, error: null };
}

export { resolveAdminSession };
