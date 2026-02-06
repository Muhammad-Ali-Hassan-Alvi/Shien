import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import Admin from "@/app/lib/model/Admin";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        isAdminLogin: { label: "Is Admin", type: "text" },
      },
      authorize: async (credentials) => {
        await connectDB();

        const identifier = credentials.identifier || credentials.email || credentials.phone;
        const isAdminLogin = credentials.isAdminLogin === 'true';

        if (!identifier || !credentials.password) {
          throw new Error("Please provide credentials");
        }

        let user = null;

        if (isAdminLogin) {
          // Check Admin Collection
          user = await Admin.findOne({ email: identifier }).lean();
        } else {
          // Check User Collection
          user = await User.findOne({
            $or: [
              { email: identifier },
              { phone: identifier }
            ]
          }).lean();
        }

        if (!user) {
          throw new Error(isAdminLogin ? "Admin not found." : "User not found.");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

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
