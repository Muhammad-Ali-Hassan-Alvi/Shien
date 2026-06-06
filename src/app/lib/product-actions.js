
"use server";

import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import { deleteProductCloudinaryImages } from "@/app/lib/cloudinaryImages";
import { revalidatePath } from "next/cache";

function normalizeId(productId) {
    if (!productId) return null;
    if (typeof productId === "string") return productId;
    if (typeof productId === "object" && productId != null) {
        if (typeof productId.toString === "function") return productId.toString();
        if (productId._id != null) return String(productId._id);
    }
    return String(productId);
}

async function requireAdminSession() {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        return { error: "Unauthorized access" };
    }
    return null;
}

function revalidateProductPaths() {
    revalidatePath("/seller-center/products");
    revalidatePath("/");
}

/** Soft-delete: move to recycle bin */
export async function archiveProduct(productId) {
    try {
        const authError = await requireAdminSession();
        if (authError) return authError;

        const id = normalizeId(productId);
        if (!id) return { error: "Product ID is required" };

        await connectDB();

        const product = await Product.findById(id);
        if (!product) return { error: "Product not found" };

        if (product.isArchived) {
            return { success: true, alreadyArchived: true };
        }

        product.isArchived = true;
        await product.save();

        revalidateProductPaths();
        return { success: true };
    } catch (e) {
        console.error("Archive Product Error:", e);
        return { error: "Failed to move product to recycle bin" };
    }
}

/** Restore from recycle bin */
export async function restoreProduct(productId) {
    try {
        const authError = await requireAdminSession();
        if (authError) return authError;

        const id = normalizeId(productId);
        if (!id) return { error: "Product ID is required" };

        await connectDB();

        const product = await Product.findById(id);
        if (!product) return { error: "Product not found" };

        if (!product.isArchived) {
            return { success: true, alreadyActive: true };
        }

        product.isArchived = false;
        await product.save();

        revalidateProductPaths();
        return { success: true };
    } catch (e) {
        console.error("Restore Product Error:", e);
        return { error: "Failed to restore product" };
    }
}

/** Permanent delete (recycle bin only) */
export async function deleteProductPermanently(productId) {
    try {
        const authError = await requireAdminSession();
        if (authError) return authError;

        const id = normalizeId(productId);
        if (!id) return { error: "Product ID is required" };

        await connectDB();

        const product = await Product.findById(id);
        if (!product) return { error: "Product not found" };

        if (!product.isArchived) {
            return { error: "Move product to recycle bin before permanent delete" };
        }

        await deleteProductCloudinaryImages(product);
        await Product.findByIdAndDelete(id);

        revalidateProductPaths();
        return { success: true };
    } catch (e) {
        console.error("Permanent Delete Product Error:", e);
        return { error: "Failed to delete product permanently" };
    }
}

async function runBulkAction(productIds, handler) {
    const authError = await requireAdminSession();
    if (authError) return authError;

    const ids = (Array.isArray(productIds) ? productIds : [])
        .map(normalizeId)
        .filter(Boolean);

    if (ids.length === 0) {
        return { error: "No products selected" };
    }

    await connectDB();

    let succeeded = 0;
    const errors = [];

    for (const id of ids) {
        const result = await handler(id);
        if (result?.success) {
            succeeded += 1;
        } else if (result?.error) {
            errors.push(result.error);
        }
    }

    if (succeeded > 0) {
        revalidateProductPaths();
    }

    return {
        success: succeeded > 0,
        succeeded,
        failed: ids.length - succeeded,
        error: succeeded === 0 ? errors[0] || "Action failed" : undefined,
    };
}

export async function archiveProductsBulk(productIds) {
    return runBulkAction(productIds, async (id) => {
        const product = await Product.findById(id);
        if (!product) return { error: "Product not found" };
        if (product.isArchived) return { success: true, alreadyArchived: true };
        product.isArchived = true;
        await product.save();
        return { success: true };
    });
}

export async function restoreProductsBulk(productIds) {
    return runBulkAction(productIds, async (id) => {
        const product = await Product.findById(id);
        if (!product) return { error: "Product not found" };
        if (!product.isArchived) return { success: true, alreadyActive: true };
        product.isArchived = false;
        await product.save();
        return { success: true };
    });
}

export async function deleteProductsPermanentlyBulk(productIds) {
    return runBulkAction(productIds, async (id) => {
        const product = await Product.findById(id);
        if (!product) return { error: "Product not found" };
        if (!product.isArchived) {
            return { error: "Move product to recycle bin before permanent delete" };
        }
        await deleteProductCloudinaryImages(product);
        await Product.findByIdAndDelete(id);
        return { success: true };
    });
}

/** @deprecated Use archiveProduct — kept for compatibility */
export async function deleteProduct(productId) {
    return archiveProduct(productId);
}
