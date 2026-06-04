import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import Admin from "@/app/lib/model/Admin";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        isAdminLogin: { label: "Is Admin", type: "text" },
      },
      authorize: async (credentials) => {
        await connectDB();

        const raw =
          credentials?.identifier || credentials?.email || credentials?.phone;
        const rawId = String(raw || "").trim();
        const identifier = rawId.includes("@")
          ? rawId.toLowerCase()
          : rawId.replace(/\s+/g, "");
        const isAdminLogin = credentials?.isAdminLogin === "true";
        const password = credentials?.password;

        if (!identifier || !password) {
          throw new Error("Please provide credentials");
        }

        let user = null;

        if (isAdminLogin) {
          user = await Admin.findOne({ email: identifier }).lean();
          if (!user) {
            throw new Error("Admin not found.");
          }
        } else {
          user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }],
          }).lean();
          if (!user) {
            throw new Error("User not found.");
          }
        }

        if (!user.password || !String(user.password).startsWith("$2")) {
          throw new Error(
            "Account password is invalid. Please reset via register or contact support."
          );
        }

        const isPasswordCorrect = await bcrypt.compare(String(password), user.password);

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials.");
        }

        // Return user object (NextAuth will put this in token)
        return {
          ...user,
          id: user._id.toString(),
          // Ensure role is set correctly
          role: isAdminLogin ? 'admin' : (user.role || 'user'),
          collection: isAdminLogin ? 'admin' : 'user'
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});
