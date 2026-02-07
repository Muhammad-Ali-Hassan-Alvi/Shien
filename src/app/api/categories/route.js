import connectDB from "@/app/lib/config/db";
import Category from "@/app/lib/model/Category";
import Product from "@/app/lib/model/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const categories = await Category.find({}).sort({ name: 1 });
        return NextResponse.json({ categories });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const { name, image, description } = await req.json();

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const category = await Category.create({ name, slug, image, description });
        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, name, description, image } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        const oldName = category.name;
        const fieldsToUpdate = {};

        if (name) {
            fieldsToUpdate.name = name;
            fieldsToUpdate.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
        if (description) fieldsToUpdate.description = description;
        if (image) fieldsToUpdate.image = image;

        const updated = await Category.findByIdAndUpdate(id, fieldsToUpdate, { new: true });

        // Update Products if name changed
        if (name && name !== oldName) {
            await Product.updateMany(
                { category: oldName },
                { $set: { category: name } }
            );
        }

        return NextResponse.json({ success: true, category: updated });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await Category.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
