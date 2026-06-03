import Category from "@/app/lib/model/Category";
import { ACTIVE_CATEGORY_FILTER } from "@/app/lib/categoryUtils";
import { sanitizeProductPayload } from "@/app/lib/productUtils";

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Verify category name exists in DB (server-only). */
export async function validateCategoryName(categoryName) {
    if (!categoryName?.trim()) {
        return { valid: false, error: "Category is required" };
    }
    const cat = await Category.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(categoryName.trim())}$`, "i") },
        ...ACTIVE_CATEGORY_FILTER,
    }).lean();
    if (!cat) {
        return { valid: false, error: `Category "${categoryName}" does not exist or is inactive` };
    }
    return { valid: true, name: cat.name };
}

export { sanitizeProductPayload };
