import { NextResponse } from "next/server";

/**
 * @deprecated Legacy JWT login — use NextAuth credentials at /auth/login instead.
 * This route is retained only for API clients that have not migrated; it returns 410 Gone.
 */
export async function POST() {
  return NextResponse.json(
    {
      message:
        "This login endpoint is deprecated. Use NextAuth via POST /api/auth/callback/credentials or sign in at /auth/login.",
      migration: "/auth/login",
    },
    { status: 410 }
  );
}
