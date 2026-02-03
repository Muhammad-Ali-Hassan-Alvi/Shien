"use server";

// src/app/lib/actions.js
// We need to fetch the user to know the role before signing in? 
// Or sign in and then get the session? 
// The signIn function runs authorize. authorize returns the user. 
// Standard NextAuth v5 signIn doesn't easily return the user object to the caller if redirect is false, 
// it returns a result object or throws.
// Let's modify the flow:

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import User from "./model/User";
import connectDB from "./config/db";

export async function authenticate(identifier, password) {
    try {
        // 1. Check role manually first (optional, but ensures we know where to go)
        await connectDB();
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        }).lean();

        // 2. Perform SignIn
        await signIn("credentials", {
            identifier, // pass identifier instead of phone
            password,
            redirect: false,
        });

        // 3. Return role
        // Check role OR userType (legacy DB field)
        const finalRole = (user?.role === 'admin' || user?.userType === 'admin') ? 'admin' : 'user';

        console.log("LOGIN DEBUG:", {
            email: user?.email,
            phone: user?.phone,
            roleDB: user?.role,
            userTypeDB: user?.userType,
            finalRole
        });

        return { success: true, role: finalRole };

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." };
                default:
                    return { error: "Something went wrong." };
            }
        }
        throw error;
    }
}

