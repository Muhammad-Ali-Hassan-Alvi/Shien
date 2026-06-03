import { buildDefaultProductVariant } from "@/app/lib/categoryUtils";
/** MongoDB filter: products with a real discount (sale < original). */
export function buildSaleQuery({ minDiscount, maxDiscount } = {}) {
    const discountPct = {
        $multiply: [
            {
                $divide: [
                    { $subtract: ["$pricing.originalPrice", "$pricing.salePrice"] },
                    "$pricing.originalPrice",
                ],
            },
            100,
        ],
    };

    const conditions = [
        { $gt: ["$pricing.originalPrice", "$pricing.salePrice"] },
        { $gt: ["$pricing.salePrice", 0] },
    ];

    if (minDiscount != null && minDiscount !== "") {
        conditions.push({ $gte: [discountPct, Number(minDiscount)] });
    }
    if (maxDiscount != null && maxDiscount !== "") {
        conditions.push({ $lte: [discountPct, Number(maxDiscount)] });
    }

    return { $expr: { $and: conditions } };
}

export const ON_SALE_FILTER = buildSaleQuery();

const ALLOWED_PRODUCT_FIELDS = [
    "name",
    "slug",
    "description",
    "category",
    "pricing",
    "variants",
    "images",
    "isDirtyPriced",
    "isFlashSale",
];

/** Find variant row matching selected size/color (case-insensitive). */
export function findMatchingVariant(variants = [], { color, size } = {}) {
    if (!variants.length) {
        return { color: color || "Default", size: size || "One Size", stock: 0 };
    }

    const norm = (s) => (s ?? "").toString().trim().toLowerCase();
    const c = norm(color);
    const s = norm(size);

    let match = variants.find(
        (v) => (!c || norm(v.color) === c) && (!s || norm(v.size) === s)
    );
    if (!match && s) match = variants.find((v) => norm(v.size) === s);
    if (!match && c) match = variants.find((v) => norm(v.color) === c);
    if (!match) match = variants[0];

    return {
        ...match,
        color: color ?? match.color,
        size: size ?? match.size,
        stock: match.stock ?? 0,
    };
}

/** Pick safe fields for create/update — prevents mass assignment. */
export function sanitizeProductPayload(body, { allowArchive = false } = {}) {    const out = {};
    for (const key of ALLOWED_PRODUCT_FIELDS) {
        if (body[key] !== undefined) out[key] = body[key];
    }
    if (allowArchive && body.isArchived !== undefined) {
        out.isArchived = !!body.isArchived;
    }
    return out;
}

/** Reverse-engineer markup % from cost and original price. */
export function deriveMarkupPercent(baseCost, originalPrice) {
    const cost = Number(baseCost) || 0;
    const orig = Number(originalPrice) || 0;
    if (cost <= 0 || orig <= cost) return 0;
    return Math.round(((orig - cost) / cost) * 100);
}

/** Reverse-engineer discount % from original and sale price. */
export function deriveDiscountPercent(originalPrice, salePrice) {
    const orig = Number(originalPrice) || 0;
    const sale = Number(salePrice) || 0;
    if (orig <= 0 || sale >= orig) return 0;
    return Math.round(((orig - sale) / orig) * 100);
}

/** Merge stock update into variants without wiping multi-variant products. */
export function mergeVariantsOnSave(existingVariants, stock, variantConfig) {
    const qty = Math.max(0, Number(stock) || 0);

    if (existingVariants?.length > 1) {
        return existingVariants.map((v) => ({ ...v }));
    }

    if (existingVariants?.length === 1) {
        const v = existingVariants[0];
        return [
            {
                ...v,
                stock: qty,
                size: variantConfig?.supportsSizes
                    ? v.size || variantConfig.sizeOptions?.[0] || "M"
                    : "One Size",
                color: variantConfig?.supportsColors ? v.color || "Default" : "Default",
            },
        ];
    }

    return buildDefaultProductVariant(qty, variantConfig);
}
