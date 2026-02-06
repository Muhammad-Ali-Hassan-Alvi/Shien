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
        const identifier = formData.get('email') || formData.get('identifier');
        const password = formData.get('password');
        const isAdminLogin = formData.get('isAdminLogin');

        await signIn("credentials", {
            identifier,
            password,
            isAdminLogin,
            redirect: false,
        });

        // If sign in is successful and redirect: false, we need to manually redirect or return success
        // But for Admin Login, we want to redirect to /seller-center
        // For User Login, we might want /profile or /

        // Actually, let's use redirect: true but handled by the component? 
        // No, Server Actions can redirect.

        /* 
           NextAuth v5 Note: signIn throws an error for redirects. 
           If we use redirect: false, it returns undefined or throws error.
        */

        // Let's re-call signIn with redirect: true for simplicity, or handle manually.
        // But we already did redirect: false above.
        // It's cleaner to let the Client Side handle redirection based on success, 
        // OR just throw redirect here.

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }

    // Manual Redirect on Success
    // We can't use `redirect` inside try/catch easily with AuthError check unless we catch it separately.
    // Ideally we let signIn handle it, but we used redirect: false above.
    // Let's change strategy: just return success and let client redirect?
    // OR: use redirect() from next/navigation

    const isAdmin = formData.get('isAdminLogin') === 'true';
    if (isAdmin) {
        // We need to import redirect
        const { redirect } = await import("next/navigation");
        redirect("/seller-center");
    } else {
        const { redirect } = await import("next/navigation");
        redirect("/profile");
    }
}


// -- Profile & Settings Actions --

import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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
