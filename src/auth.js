import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/app/lib/config/db";
import User from "@/app/lib/model/User";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        await connectDB();

        // Allow login with either email or phone
        // The screenshot shows admins have emails like "admin@admin.com"
        // Users might have phones. 
        // We check if the input looks like an email or just search both.

        const identifier = credentials.identifier || credentials.email || credentials.phone;

        if (!identifier || !credentials.password) {
          throw new Error("Please provide both email/phone and password");
        }

        // Search by email OR phone
        const user = await User.findOne({
          $or: [
            { email: identifier },
            { phone: identifier }
          ]
        }).lean();

        if (!user) {
          throw new Error("User not found.");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials.");
        }

        return user;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});
