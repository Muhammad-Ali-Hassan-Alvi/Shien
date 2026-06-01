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
        } else {
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

/** Collect all descendant category names (including the node itself). */
export function collectDescendantNames(node) {
    const names = [node.name];
    for (const child of node.children || []) {
        names.push(...collectDescendantNames(child));
    }
    return names;
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

/** Build grouped sections for category list panel (Sapphire-style). */
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
