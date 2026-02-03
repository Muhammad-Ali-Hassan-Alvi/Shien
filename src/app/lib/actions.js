"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(phone, password) {
    try {
        await signIn("credentials", {
            phone,
            password,
            redirect: false, // We handle redirect on client
        });
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." };
                default:
                    return { error: "Something went wrong." };
            }
        }
        // NextAuth throws error on success if redirect is true, but we set redirect: false?
        // Actually redirect: false works but signIn might still throw for flow control?
        // In v5, signIn throws. If no error, wait... with redirect: false it returns result? 
        // Actually v5 documentation says signIn throws on redirect.
        // If redirect: false, it returns nothing?

        // For safety, let's treat any non-AuthError as success if we aren't redirecting? 
        // Re-throwing helps debugging but...
        throw error;
    }
}
