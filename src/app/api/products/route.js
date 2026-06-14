import connectDB from "@/app/lib/config/db";
import { deleteProductCloudinaryImages } from "@/app/lib/cloudinaryImages";
import Product from "@/app/lib/model/Product";
import Category from "@/app/lib/model/Category";
import User from "@/app/lib/model/User";
import {
    buildCategoryTree,
    findCategoryInTree,
    collectDescendantNames,
    ACTIVE_CATEGORY_FILTER,
    slugify,
} from "@/app/lib/categoryUtils";
import {
    getShopVisibleCategoryNames,
    buildShopCategoryQuery,
} from "@/app/lib/shopCategories";
import { createManyUserNotifications, notifyLowStockIfNeeded } from "@/lib/notificationService";
import {
    buildSaleQuery,
} from "@/app/lib/productUtils";
import {
    sanitizeProductPayload,
    validateCategoryName,
} from "@/app/lib/productServerUtils";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/requireAdmin";

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Resolve URL param (name or slug) to product category name(s). Returns null if unresolved. */
async function resolveCategoryNames(categoryParam) {
    if (!categoryParam) return null;

    const allCategories = await Category.find(ACTIVE_CATEGORY_FILTER).lean();
    const tree = buildCategoryTree(allCategories);

    let match = findCategoryInTree(tree, categoryParam);
    if (!match) {
        const norm = categoryParam.toLowerCase();
        const slugNorm = slugify(categoryParam);
        const direct = allCategories.find(
            (c) =>
                c.name.toLowerCase() === norm ||
                c.slug?.toLowerCase() === norm ||
                c.slug?.toLowerCase() === slugNorm
        );
        if (direct) match = findCategoryInTree(tree, direct.name) || direct;
    }

    if (match) {
        return match.children?.length
            ? collectDescendantNames(match)
            : [match.name];
    }

    return null;
}

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        // Single Product Fetch (admin)
        if (id) {
            const { error: authError } = await requireAdmin();
            if (authError) return authError;

            const product = await Product.findById(id).lean();
            if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

            const wishlistCount = await User.countDocuments({ wishlist: id });
            return NextResponse.json({ product: { ...product, wishlistCount } });
        }

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const category = searchParams.get("category");
        const sort = searchParams.get("sort");
        const includeStats = searchParams.get("includeStats");
        const search = searchParams.get("search");
        const archived = searchParams.get("archived");

        if (includeStats === "true" || archived === "true") {
            const { error: authError } = await requireAdmin();
            if (authError) return authError;
        }
        const skip = (page - 1) * limit;

        const query = {};
        const isAdminList = includeStats === "true";

        if (isAdminList) {
            if (archived === "true") {
                query.isArchived = true;
            } else {
                query.isArchived = { $ne: true };
            }
        } else {
            query.isArchived = { $ne: true };
        }

        const shopCategoryNames = !isAdminList ? await getShopVisibleCategoryNames() : null;

        if (category) {
            const categoryNames = await resolveCategoryNames(category);
            if (categoryNames?.length === 1) {
                query.category = new RegExp(`^${escapeRegex(categoryNames[0])}$`, "i");
            } else if (categoryNames?.length > 1) {
                query.category = {
                    $in: categoryNames.map((n) => new RegExp(`^${escapeRegex(n)}$`, "i")),
                };
            } else if (!isAdminList) {
                return NextResponse.json({
                    products: [],
                    hasMore: false,
                    page,
                    total: 0,
                    priceBounds: null,
                });
            } else {
                // Admin — flexible match (e.g. category-2 → Category 2)
                const parts = category.split(/[-_\s]+/).filter(Boolean).map(escapeRegex);
                if (parts.length > 0) {
                    query.category = new RegExp(parts.join("[\\s\\-_]*"), "i");
                } else {
                    query.category = new RegExp(escapeRegex(category), "i");
                }
            }
        } else if (!isAdminList && shopCategoryNames) {
            Object.assign(query, buildShopCategoryQuery(shopCategoryNames));
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        const minPriceParam = searchParams.get("minPrice");
        const maxPriceParam = searchParams.get("maxPrice");
        const priceFilter = {};
        if (minPriceParam != null && minPriceParam !== "") {
            const min = Number(minPriceParam);
            if (!Number.isNaN(min) && min >= 0) priceFilter.$gte = min;
        }
        if (maxPriceParam != null && maxPriceParam !== "") {
            const max = Number(maxPriceParam);
            if (!Number.isNaN(max) && max >= 0) priceFilter.$lte = max;
        }
        if (Object.keys(priceFilter).length > 0) {
            query["pricing.salePrice"] = priceFilter;
        }

        const minDiscountParam = searchParams.get("minDiscount");
        const maxDiscountParam = searchParams.get("maxDiscount");

        let sortOption = { createdAt: -1, _id: -1 };
        if (sort === "sale") {
            Object.assign(query, buildSaleQuery({ minDiscount: minDiscountParam, maxDiscount: maxDiscountParam }));
            sortOption = { "pricing.salePrice": 1, _id: -1 };
        } else if (minDiscountParam || maxDiscountParam) {
            Object.assign(query, buildSaleQuery({ minDiscount: minDiscountParam, maxDiscount: maxDiscountParam }));
        } else if (sort === "bestsellers") {
            sortOption = { reviewCount: -1, averageRating: -1, createdAt: -1, _id: -1 };
        } else if (sort === "new") {
            sortOption = { createdAt: -1, _id: -1 };
        } else if (sort === "price_asc") {
            sortOption = { "pricing.salePrice": 1, _id: -1 };
        } else if (sort === "price_desc") {
            sortOption = { "pricing.salePrice": -1, _id: -1 };
        }

        let products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Product.countDocuments(query);
        const hasMore = total > skip + products.length;

        // If admin requests stats (like wishlist count)
        if (includeStats === 'true') {
            const productIds = products.map(p => p._id);

            // Aggregate wishlist counts
            const wishlistCounts = await User.aggregate([
                { $unwind: "$wishlist" },
                { $match: { wishlist: { $in: productIds } } },
                { $group: { _id: "$wishlist", count: { $sum: 1 } } }
            ]);

            const countMap = {};
            wishlistCounts.forEach(w => countMap[w._id.toString()] = w.count);

            products = products.map(p => ({
                ...p,
                wishlistCount: countMap[p._id.toString()] || 0
            }));
        }

        let priceBounds = null;
        if (!isAdminList) {
            const boundsQuery = { isArchived: { $ne: true } };
            if (category) {
                const categoryNames = await resolveCategoryNames(category);
                if (categoryNames?.length === 1) {
                    boundsQuery.category = new RegExp(`^${escapeRegex(categoryNames[0])}$`, "i");
                } else if (categoryNames?.length > 1) {
                    boundsQuery.category = {
                        $in: categoryNames.map((n) => new RegExp(`^${escapeRegex(n)}$`, "i")),
                    };
                } else {
                    const parts = category.split(/[-_\s]+/).filter(Boolean).map(escapeRegex);
                    if (parts.length > 0) {
                        boundsQuery.category = new RegExp(parts.join("[\\s\\-_]*"), "i");
                    }
                }
            }
            const [agg] = await Product.aggregate([
                { $match: boundsQuery },
                {
                    $group: {
                        _id: null,
                        min: { $min: "$pricing.salePrice" },
                        max: { $max: "$pricing.salePrice" },
                    },
                },
            ]);
            if (agg) {
                priceBounds = {
                    min: Math.floor(agg.min ?? 0),
                    max: Math.ceil(agg.max ?? 0),
                };
            }
        }

        return NextResponse.json({
            products,
            hasMore,
            page,
            total,
            priceBounds,
        });

    } catch (error) {
        console.error("Fetch Products Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const body = await req.json();

        if (!body.name || !body.slug) {
            return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
        }

        if (!body.description?.trim()) {
            return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }

        const catCheck = await validateCategoryName(body.category);
        if (!catCheck.valid) {
            return NextResponse.json({ error: catCheck.error }, { status: 400 });
        }

        const payload = sanitizeProductPayload(body);
        payload.category = catCheck.name;

        const existing = await Product.findOne({ slug: payload.slug });
        if (existing) {
            return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 });
        }

        const newProduct = new Product(payload);
        await newProduct.save();

        return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const body = await req.json();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // Get OLD product to check stock
        const oldProduct = await Product.findById(id);
        if (!oldProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        // Calculate old stock (sum of variants or totalStock field if exists - assuming variants approach)
        const oldStock = oldProduct.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

        const updates = sanitizeProductPayload(body, { allowArchive: true });

        if (updates.category !== undefined) {
            const catCheck = await validateCategoryName(updates.category);
            if (!catCheck.valid) {
                return NextResponse.json({ error: catCheck.error }, { status: 400 });
            }
            updates.category = catCheck.name;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

        // Calculate new stock
        const newStock = updatedProduct.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

        // RESTOCK ALERT LOGIC
        // If it was out of stock (<= 0) and now has stock (> 0)
        if (oldStock <= 0 && newStock > 0) {
            // Find users who have this product in their wishlist
            const interestedUsers = await User.find({ wishlist: id });

            if (interestedUsers.length > 0) {
                const notifications = interestedUsers.map(user => ({
                    user: user._id,
                    type: "Restock",
                    message: `Good news! "${updatedProduct.name}" is back in stock!`,
                    link: `/product/${updatedProduct.slug}`,
                    isRead: false
                }));

                await createManyUserNotifications(notifications);
                console.log(`Created restock notifications for ${notifications.length} users.`);
            }
        }

        try {
            await notifyLowStockIfNeeded(updatedProduct, id);
        } catch (e) {
            console.error("Low stock notification failed:", e);
        }

        return NextResponse.json({ success: true, product: updatedProduct });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const permanent = searchParams.get("permanent") === "true";
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (permanent) {
            if (!product.isArchived) {
                return NextResponse.json(
                    { error: "Move product to recycle bin before permanent delete" },
                    { status: 400 }
                );
            }
            await deleteProductCloudinaryImages(product);
            await Product.findByIdAndDelete(id);
            return NextResponse.json({ success: true, permanent: true });
        }

        product.isArchived = true;
        await product.save();
        return NextResponse.json({ success: true, archived: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
