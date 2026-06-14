import Category from "@/app/lib/model/Category";
import {
    ACTIVE_CATEGORY_FILTER,
    buildCategoryTree,
    collectCategoryNamesFromTree,
} from "@/app/lib/categoryUtils";

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Category names visible on the storefront (active tree only). */
export async function getShopVisibleCategoryNames() {
    const categories = await Category.find(ACTIVE_CATEGORY_FILTER).lean();
    return collectCategoryNamesFromTree(buildCategoryTree(categories));
}

/** Mongo filter: products in active categories, or uncategorized. */
export function buildShopCategoryQuery(activeNames) {
    if (!activeNames?.length) {
        return {
            $or: [{ category: { $exists: false } }, { category: null }, { category: "" }],
        };
    }

    const inActive = {
        $in: activeNames.map((n) => new RegExp(`^${escapeRegex(n)}$`, "i")),
    };

    return {
        $or: [{ category: inActive }, { category: { $exists: false } }, { category: null }, { category: "" }],
    };
}

/** Active category tree for server-side shop checks. */
export async function getShopCategoryTree() {
    const categories = await Category.find(ACTIVE_CATEGORY_FILTER).lean();
    return buildCategoryTree(categories);
}
