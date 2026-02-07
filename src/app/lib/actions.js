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
        // formData can be a FormData object or a plain object if called directly (though actions receive FormData)
        // If called from client transition (useResult), it's FormData.

        // Handle both FormData object and plain object (in case of direct call)
        let identifier, password;

        if (formData instanceof FormData) {
            identifier = formData.get('identifier');
            password = formData.get('password');
        } else {
            // Fallback if passed as plain object/arguments (not ideal for server action used in form)
            // But user code was calling authenticate(identifier, password) directly!
            // THIS is the issue. The client code is calling it like a normal function with args.
            // Server Actions should be called with FormData regarding useFormState, OR arguments.
            // If the client calls `authenticate(id, pass)`, then `prevState` is `id` and `formData` is `pass`.
            // BUT `authenticate` is exported as an action. 

            // Let's adapt the function to support direct argument call which the client is doing.
            // Client: authenticate(identifier, password)
            // So: prevState = identifier, formData = password.

            identifier = prevState;
            password = formData;
        }

        if (!identifier || !password) return { error: "Missing fields" };

        await signIn("credentials", {
            identifier,
            password,
            redirect: false,
        });

        // We need to know who logged in to return role
        // Re-fetch session?
        // Or just return success.
        // Client side refresh will handle session update.

        // Hack: We don't have the user object here easily from signIn(redirect:false) in v5 without `auth()`.
        // Let's query DB to get role for redirect hint.
        await connectDB();
        // Check for email or phone
        const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
        const role = user?.role || 'user';

        return { success: true, role };

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
