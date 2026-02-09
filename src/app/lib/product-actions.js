
"use server";

import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId) {
    try {
        const session = await auth();
        // Check if admin
        if (session?.user?.role !== 'admin') {
            return { error: "Unauthorized access" };
        }

        if (!productId) return { error: "Product ID is required" };

        await connectDB();

        const deleted = await Product.findByIdAndDelete(productId);

        if (!deleted) return { error: "Product not found" };

        revalidatePath("/seller-center/products");
        revalidatePath("/"); // Update home if featured
        return { success: true };

    } catch (e) {
        console.error("Delete Product Error:", e);
        return { error: "Failed to delete product" };
    }
}
