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
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        await connectDB();
        const user = await User.findOne({ phone: credentials.phone });

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
