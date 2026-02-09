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

export async function authenticate(prevState, formData) {
    try {
        let identifier, password, isAdminLogin;

        if (formData instanceof FormData) {
            identifier = formData.get('identifier') || formData.get('email');
            password = formData.get('password');
            isAdminLogin = formData.get('isAdminLogin');
        } else {
            // Fallback for direct calls (not recommended but keeping backward compat locally)
            // usage: authenticate(identifier, password)
            identifier = prevState;
            password = formData;
        }

        if (!identifier || !password) return { error: "Missing fields" };

        await signIn("credentials", {
            identifier,
            password,
            isAdminLogin,
            redirect: false,
        });

        // After successful signIn (since redirect: false), we need to determine where to redirect
        // However, middleware or client should handle redirection based on session.
        // But the previous code wanted to return role.

        await connectDB();
        // Check for email or phone
        let user;
        if (isAdminLogin === 'true') {
            // Import Admin model dynamically or ensure it is imported
            const Admin = require("./model/Admin").default;
            user = await Admin.findOne({ email: identifier });
        } else {
            user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
        }

        const role = user?.role || (isAdminLogin === 'true' ? 'admin' : 'user');

        return { success: true, role };

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." };
                default:
                    return { error: "Something went wrong." };
            }
        }
        // If it's a "Digest" error (NextJs redirect), rethrow
        // But here we used redirect: false, so it shouldn't redirect throw.
        // Actually, signIn with redirect:false might still throw if something else fails? 
        // No, it returns { error, status, ok, url } in client, but on server actions?
        // Server-side signIn with redirect:false calls the provider. If authorize throws, it throws CallbackRouteError.

        // If valid error object
        if (error.message) {
            return { error: error.message };
        }

        return { error: "Authentication failed" };
    }
}


import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// -- Profile & Settings Actions --

export async function updateProfile(formData) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Not authenticated" };

        // Ensure ID is string
        const userId = session.user.id.toString();
        if (userId === "[object Object]") {
            return { error: "Session corrupted. Please Logout and Login again." };
        }

        const name = formData.get("name");
        const email = formData.get("email");

        await connectDB();

        // Check if email is already taken by another user
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: userId } });
            if (existing) return { error: "Email already in use" };
        }

        await User.findByIdAndUpdate(userId, {
            name,
            email
        });

        revalidatePath("/seller-center/settings");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update profile" };
    }
}

export async function changePassword(currentPassword, newPassword) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Not authenticated" };

        const userId = session.user.id.toString();
        if (userId === "[object Object]") {
            return { error: "Session corrupted. Please Logout and Login again." };
        }

        await connectDB();
        const user = await User.findById(userId);

        if (!user || !user.password) return { error: "User not found" };

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return { error: "Incorrect current password" };

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update
        user.password = hashedPassword;
        await user.save();

        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to change password" };
    }
}
