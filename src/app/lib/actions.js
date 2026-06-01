"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import User from "./model/User";
import Admin from "./model/Admin";
import connectDB from "./config/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

function parseCredentials(prevState, formData) {
    if (formData instanceof FormData) {
        return {
            identifier:
                formData.get("identifier") ||
                formData.get("email") ||
                formData.get("phone"),
            password: formData.get("password"),
            isAdminLogin: formData.get("isAdminLogin") === "true",
        };
    }
    // Legacy: authenticate(identifier, password) from login page
    if (typeof prevState === "string" && typeof formData === "string") {
        return {
            identifier: prevState,
            password: formData,
            isAdminLogin: false,
        };
    }
    return { identifier: null, password: null, isAdminLogin: false };
}

function normalizeIdentifier(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.includes("@")) return raw.toLowerCase();
    return raw.replace(/\s+/g, "");
}

export async function authenticate(prevState, formData) {
    try {
        const { identifier, password, isAdminLogin } = parseCredentials(prevState, formData);
        const normalizedId = normalizeIdentifier(identifier);

        if (!normalizedId || !password) {
            return { error: "Please enter your email/phone and password." };
        }

        const result = await signIn("credentials", {
            identifier: normalizedId,
            password: String(password),
            isAdminLogin: isAdminLogin ? "true" : "false",
            redirect: false,
        });

        // NextAuth v5: failed login returns { ok: false, error: "..." } without throwing
        if (result?.error || result?.ok === false) {
            return {
                error:
                    result.error === "CredentialsSignin"
                        ? "Invalid email/phone or password."
                        : result.error || "Login failed. Please try again.",
            };
        }

        await connectDB();

        let role = "user";
        if (isAdminLogin) {
            const admin = await Admin.findOne({ email: normalizedId }).lean();
            role = admin?.role || "admin";
        } else {
            const user = await User.findOne({
                $or: [{ email: normalizedId }, { phone: normalizedId }],
            }).lean();
            role = user?.role || user?.userType || "user";
        }

        return { success: true, role };
    } catch (error) {
        if (error instanceof AuthError) {
            const message =
                error.cause?.message ||
                (error.type === "CredentialsSignin"
                    ? "Invalid email/phone or password."
                    : "Something went wrong.");

            if (message.includes("Admin not found")) {
                return {
                    error:
                        "No admin account with this email. Use /admin/login or run: node scripts/create_admin.mjs",
                };
            }
            if (message.includes("User not found")) {
                return {
                    error: "No account found with this email or phone. Please register first.",
                };
            }
            if (message.includes("Invalid credentials")) {
                return { error: "Invalid email/phone or password." };
            }

            return { error: message };
        }

        if (error?.message) {
            return { error: error.message };
        }

        return { error: "Authentication failed" };
    }
}

export async function updateProfile(formData) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Not authenticated" };

        const userId = session.user.id.toString();
        if (userId === "[object Object]") {
            return { error: "Session corrupted. Please Logout and Login again." };
        }

        const name = formData.get("name");
        const email = formData.get("email");

        await connectDB();

        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: userId } });
            if (existing) return { error: "Email already in use" };
        }

        await User.findByIdAndUpdate(userId, {
            name,
            email,
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

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return { error: "Incorrect current password" };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to change password" };
    }
}
