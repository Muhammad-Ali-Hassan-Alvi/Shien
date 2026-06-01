import connectDB from "@/app/lib/config/db";
import Category from "@/app/lib/model/Category";
import Product from "@/app/lib/model/Product";
import { requireAdmin } from "@/app/lib/requireAdmin";
import { buildCategoryTree, slugify, ACTIVE_CATEGORY_FILTER } from "@/app/lib/categoryUtils";
import { NextResponse } from "next/server";

async function wouldCreateCycle(categoryId, newParentId) {
    if (!newParentId) return false;
    if (String(categoryId) === String(newParentId)) return true;

    let current = await Category.findById(newParentId).lean();
    while (current?.parent) {
        if (String(current.parent) === String(categoryId)) return true;
        current = await Category.findById(current.parent).lean();
    }
    return false;
}

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const tree = searchParams.get("tree") === "true";
        const navOnly = searchParams.get("nav") === "true";
        const adminView = searchParams.get("admin") === "true";

        const filter = adminView ? {} : { ...ACTIVE_CATEGORY_FILTER };

        let categories = await Category.find(filter)
            .sort({ order: 1, name: 1 })
            .lean();

        if (tree) {
            let treeData = buildCategoryTree(categories);
            if (navOnly) {
                treeData = treeData.filter((cat) => cat.showInNav !== false);
            }
            const linesOnly = searchParams.get("lines") === "true";
            if (linesOnly) {
                treeData = treeData.filter((cat) => cat.isLine === true);
            }
            return NextResponse.json({ categories: treeData });
        }

        if (navOnly) {
            categories = categories.filter((cat) => cat.showInNav !== false && !cat.parent);
        }

        return NextResponse.json({ categories });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const { name, image, description, parentId, order, showInNav, isActive, isLine } = await req.json();

        if (!name?.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if (parentId) {
            const parent = await Category.findById(parentId);
            if (!parent) {
                return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
            }
        }

        const slug = slugify(name);

        const category = await Category.create({
            name: name.trim(),
            slug,
            image,
            description,
            parent: parentId || null,
            order: order ?? 0,
            showInNav: showInNav ?? true,
            isActive: isActive ?? true,
            isLine: parentId ? false : isLine ?? false,
        });

        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const body = await req.json();
        const { id, name, description, image, parentId, order, showInNav, isActive, isLine } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        if (parentId !== undefined) {
            if (parentId && (await wouldCreateCycle(id, parentId))) {
                return NextResponse.json({ error: "Cannot set parent — would create a cycle" }, { status: 400 });
            }
            if (parentId) {
                const parent = await Category.findById(parentId);
                if (!parent) {
                    return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
                }
            }
        }

        const oldName = category.name;
        const fieldsToUpdate = {};

        if (name?.trim()) {
            fieldsToUpdate.name = name.trim();
            fieldsToUpdate.slug = slugify(name);
        }
        if (description !== undefined) fieldsToUpdate.description = description;
        if (image !== undefined) fieldsToUpdate.image = image;
        if (parentId !== undefined) fieldsToUpdate.parent = parentId || null;
        if (order !== undefined) fieldsToUpdate.order = order;
        if (showInNav !== undefined) fieldsToUpdate.showInNav = showInNav;
        if (isActive !== undefined) fieldsToUpdate.isActive = isActive;
        if (isLine !== undefined) {
            fieldsToUpdate.isLine = parentId !== undefined && parentId ? false : isLine;
        }

        const updated = await Category.findByIdAndUpdate(id, fieldsToUpdate, { new: true });

        if (name && name.trim() !== oldName) {
            await Product.updateMany({ category: oldName }, { $set: { category: name.trim() } });
        }

        return NextResponse.json({ success: true, category: updated });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
        }
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

        const childCount = await Category.countDocuments({ parent: id });
        if (childCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete — category has subcategories. Delete or move them first." },
                { status: 400 }
            );
        }

        await Category.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
