import { auth } from "@/auth";
import { NextResponse } from "next/server";

/** Returns session or a 401 NextResponse for route handlers. */
export async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        return {
            session: null,
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }
    return { session, error: null };
}
