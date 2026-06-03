import { productsLink } from "@/app/lib/navLinks";

/** Match categories that are active (includes legacy docs without isActive field). */
export const ACTIVE_CATEGORY_FILTER = { isActive: { $ne: false } };

/** Slugify a category name for URLs. */
export function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Build a nested tree from a flat category list. */
export function buildCategoryTree(categories) {
    const map = new Map();
    const roots = [];

    for (const cat of categories) {
        map.set(String(cat._id), { ...cat, children: [] });
    }

    for (const cat of categories) {
        const node = map.get(String(cat._id));
        const parentId = cat.parent ? String(cat.parent) : null;
        if (parentId && map.has(parentId)) {
            map.get(parentId).children.push(node);
        } else if (!parentId) {
            // Only true roots — never promote children whose parent was filtered out (e.g. inactive)
            roots.push(node);
        }
    }

    const sortNodes = (nodes) => {
        nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
        nodes.forEach((n) => sortNodes(n.children));
    };
    sortNodes(roots);

    return roots;
}

/** Remove nodes hidden from nav and prune empty branches (shop header / menu). */
export function filterNavCategoryTree(tree) {
    const walk = (nodes) =>
        (nodes || [])
            .filter((n) => n.showInNav !== false && n.isActive !== false)
            .map((n) => {
                const children = walk(n.children);
                return { ...n, children };
            });

    return walk(tree);
}

/** Collect all descendant category names (including the node itself). */
export function collectDescendantNames(node) {
    const names = [node.name];
    for (const child of node.children || []) {
        names.push(...collectDescendantNames(child));
    }
    return names;
}

/** Names from root to the matched category (for breadcrumbs). */
export function findCategoryPathInTree(tree, value) {
    if (!value) return null;
    const needle = value.toLowerCase();

    const walk = (nodes, path) => {
        for (const node of nodes) {
            const next = [...path, node.name];
            if (
                node.name.toLowerCase() === needle ||
                (node.slug && node.slug.toLowerCase() === needle)
            ) {
                return next;
            }
            const found = walk(node.children || [], next);
            if (found) return found;
        }
        return null;
    };

    return walk(tree || [], []);
}

/** Full breadcrumb string, e.g. "Automotive and Motorbike › Bike". */
export function formatCategoryBreadcrumb(tree, categoryName) {
    const path = findCategoryPathInTree(tree, categoryName);
    if (!path?.length) return categoryName?.trim() || "Uncategorized";
    return path.join(" › ");
}

/** Find a category node in the tree by name or slug (case-insensitive). */
export function findCategoryInTree(tree, value) {
    if (!value) return null;
    const needle = value.toLowerCase();

    const walk = (nodes) => {
        for (const node of nodes) {
            if (
                node.name.toLowerCase() === needle ||
                (node.slug && node.slug.toLowerCase() === needle)
            ) {
                return node;
            }
            const found = walk(node.children || []);
            if (found) return found;
        }
        return null;
    };

    return walk(tree);
}

/** Options for admin selects: indented labels, all levels (root → subcategory). */
export function buildCategorySelectOptions(tree, { includeInactive = true } = {}) {
    const flat = flattenCategoryTree(tree || []);
    return flat
        .filter((n) => includeInactive || n.isActive !== false)
        .map((node) => {
            const path = findCategoryPathInTree(tree, node.name);
            const breadcrumb = path?.length ? path.join(" › ") : node.name;
            const inactive = node.isActive === false ? " (inactive)" : "";
            return {
                value: node.name,
                label: `${breadcrumb}${inactive}`,
            };
        });
}

/** Flatten tree to a list with depth info for sidebar rendering. */
export function flattenCategoryTree(tree, depth = 0) {
    const result = [];
    for (const node of tree) {
        result.push({ ...node, depth });
        if (node.children?.length) {
            result.push(...flattenCategoryTree(node.children, depth + 1));
        }
    }
    return result;
}

/** Root categories marked as Lines (Sapphire-style nav tabs). */
export function getLineCategories(tree) {
    return (tree || []).filter((node) => node.isLine === true && !node.parent);
}

/** Root categories for regular navbar (excludes lines). */
export function getNavCategories(tree) {
    return (tree || []).filter((node) => node.isLine !== true);
}

/**
 * Mega menu columns for navbar hover.
 * Leaf subcategories (no children) appear once as a linked heading — not title + duplicate row.
 */
export function buildMegaMenuColumns(parentNode) {
    const children = parentNode?.children || [];
    if (!children.length) return null;

    return children.map((child) => {
        const nested = child.children || [];
        if (nested.length > 0) {
            return {
                title: child.name,
                items: nested.map((c) => ({ name: c.name })),
            };
        }
        return { title: child.name, items: [] };
    });
}

/** Default product options when no category overrides exist (clothing-style). */
export const DEFAULT_VARIANT_SETTINGS = {
    supportsSizes: true,
    supportsColors: true,
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    inheritedFrom: null,
};

/** Flat list from a category tree (strips children, keeps parent ref). */
export function flattenCategoriesFlat(tree) {
    const result = [];
    const walk = (nodes) => {
        for (const node of nodes || []) {
            const { children, depth, ...cat } = node;
            void depth;
            result.push(cat);
            if (children?.length) walk(children);
        }
    };
    walk(tree);
    return result;
}

/**
 * Resolve effective size/color rules for a category name.
 * Walks up the tree until a category with customVariantSettings is found.
 */
export function resolveEffectiveVariantSettings(flatCategories, categoryName) {
    if (!categoryName || !flatCategories?.length) {
        return { ...DEFAULT_VARIANT_SETTINGS };
    }

    const byId = new Map(flatCategories.map((c) => [String(c._id), c]));
    let node = flatCategories.find(
        (c) => c.name?.toLowerCase() === categoryName.toLowerCase()
    );
    if (!node) {
        return { ...DEFAULT_VARIANT_SETTINGS };
    }

    while (node) {
        if (node.customVariantSettings === true) {
            return {
                supportsSizes: node.supportsSizes !== false,
                supportsColors: node.supportsColors !== false,
                sizeOptions:
                    node.sizeOptions?.length > 0
                        ? node.sizeOptions
                        : DEFAULT_VARIANT_SETTINGS.sizeOptions,
                inheritedFrom: node.name,
            };
        }
        const parentId = node.parent ? String(node.parent) : null;
        node = parentId ? byId.get(parentId) : null;
    }

    return { ...DEFAULT_VARIANT_SETTINGS };
}

/** Build a single default variant row for admin product save. */
export function buildDefaultProductVariant(stock, variantConfig) {
    const cfg = variantConfig || DEFAULT_VARIANT_SETTINGS;
    return [
        {
            color: cfg.supportsColors ? "Default" : "Default",
            size: cfg.supportsSizes
                ? cfg.sizeOptions?.[0] || "M"
                : "One Size",
            stock: Math.max(0, Number(stock) || 0),
        },
    ];
}

/** Short label for admin category tree badges. */
export function formatVariantSettingsLabel(settings) {
    if (!settings) return "Sizes & colors";
    const parts = [];
    if (settings.supportsSizes) parts.push("Sizes");
    if (settings.supportsColors) parts.push("Colors");
    if (!parts.length) return "Stock only";
    return parts.join(" + ");
}

/** Build right-panel groups for a line or department node. */
export function getGroupsForDepartment(dept) {
    if (!dept) return [];

    const children = dept.children || [];
    if (children.length === 0) return [];

    const hasNestedGroups = children.some((c) => c.children?.length > 0);
    if (hasNestedGroups) {
        return children.map((group) => ({
            title: group.name,
            items:
                group.children?.length > 0
                    ? group.children
                    : [{ name: group.name, _id: group._id }],
        }));
    }

    return [{ title: "Shop", items: children }];
}

/** Full Sapphire-style hamburger sidebar for the active department tab. */
export function buildHamburgerSidebarItems(lineName) {
    if (!lineName) return [];
    return [
        {
            id: "shop-sale",
            type: "link",
            label: "Shop Sale",
            href: productsLink({ category: lineName, sort: "sale" }),
            highlight: true,
        },
        { id: "shop-by-category", type: "panel", label: "Shop by Category" },
        { id: "shop-by-discount", type: "panel", label: "Shop by Discount" },
        {
            id: "under-2000",
            type: "link",
            label: "Under Rs. 2,000",
            href: productsLink({ category: lineName, maxPrice: 2000 }),
        },
        {
            id: "under-3000",
            type: "link",
            label: "Under Rs. 3,000",
            href: productsLink({ category: lineName, maxPrice: 3000 }),
        },
        {
            id: "under-5000",
            type: "link",
            label: "Under Rs. 5,000",
            href: productsLink({ category: lineName, maxPrice: 5000 }),
        },
    ];
}

/** Right-panel content when a sidebar panel item is selected. */
export function getHamburgerPanelContent(menuId, lineNode) {
    if (!lineNode?.name) return { title: "", groups: [] };

    const lineName = lineNode.name;
    const children = lineNode.children || [];

    if (menuId === "shop-by-category") {
        if (children.length > 0) {
            return {
                title: "Shop by Category",
                groups: getGroupsForDepartment(lineNode),
            };
        }
        return {
            title: "Shop by Category",
            groups: [
                {
                    title: lineName,
                    items: [{ name: lineName, _id: lineNode._id }],
                },
            ],
        };
    }

    if (menuId === "shop-by-discount") {
        return {
            title: "Shop by Discount",
            groups: [
                {
                    title: "Discount ranges",
                    items: [
                        {
                            name: "Up to 25% Off",
                            href: productsLink({ category: lineName, sort: "sale", maxDiscount: 25 }),
                        },
                        {
                            name: "Up to 40% Off",
                            href: productsLink({ category: lineName, sort: "sale", maxDiscount: 40 }),
                        },
                        {
                            name: "All Sale Items",
                            href: productsLink({ category: lineName, sort: "sale" }),
                            highlight: true,
                        },
                    ],
                },
            ],
        };
    }

    return { title: "", groups: [] };
}
