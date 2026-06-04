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
        color: match.color || "Default",
        size: match.size || "One Size",
        stock: match.stock ?? 0,
    };
}

/** Resolve a cart/checkout variant to a real product variant index. */
export function resolveVariantForOrder(variants = [], requested = {}) {
    const resolved = findMatchingVariant(variants, requested);
    const norm = (s) => (s ?? "").toString().trim().toLowerCase();

    let index = variants.findIndex(
        (v) => norm(v.color) === norm(resolved.color) && norm(v.size) === norm(resolved.size)
    );
    if (index === -1 && variants.length > 0) index = 0;

    return {
        index,
        variant: index >= 0 ? variants[index] : null,
        resolved,
    };
}

/** Pick safe fields for create/update — prevents mass assignment. */
export function sanitizeProductPayload(body, { allowArchive = false } = {}) {
    const out = {};
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

/** Build admin form rows from saved variants or category defaults. */
export function createInitialVariantRows(variantConfig, existingVariants = []) {
    if (existingVariants?.length > 0) {
        return existingVariants.map((v) => ({
            color: v.color || "Default",
            size: v.size || "One Size",
            stock: v.stock ?? 0,
        }));
    }

    const cfg = variantConfig || {};
    const sizesOnly = cfg.supportsSizes && !cfg.supportsColors;
    const colorsOnly = cfg.supportsColors && !cfg.supportsSizes;
    const both = cfg.supportsSizes && cfg.supportsColors;
    const neither = !cfg.supportsSizes && !cfg.supportsColors;

    if (neither) {
        return [{ color: "Default", size: "One Size", stock: 100 }];
    }
    if (sizesOnly) {
        const opts = cfg.sizeOptions?.length ? cfg.sizeOptions : ["XS", "S", "M", "L", "XL"];
        return opts.map((size) => ({ color: "Default", size, stock: 0 }));
    }
    if (colorsOnly) {
        return [{ color: "Black", size: "One Size", stock: 100 }];
    }
    if (both) {
        return [
            {
                color: "Black",
                size: cfg.sizeOptions?.[0] || "M",
                stock: 100,
            },
        ];
    }
    return [{ color: "Default", size: "One Size", stock: 100 }];
}

/** Convert admin variant rows to product.variants payload. */
export function buildVariantsFromAdminRows(rows, variantConfig) {
    const cfg = variantConfig || {};
    const normalized = (rows || []).map((r) => ({
        color: cfg.supportsColors ? (r.color?.trim() || "Default") : "Default",
        size: cfg.supportsSizes ? (r.size?.trim() || "One Size") : "One Size",
        stock: Math.max(0, Number(r.stock) || 0),
    }));

    const withStock = normalized.filter((r) => r.stock > 0);
    if (withStock.length > 0) return withStock;
    if (normalized.length === 1) return normalized;
    return buildDefaultProductVariant(0, cfg);
}
