import connectDB from "@/app/lib/config/db";
import Hero from "@/app/lib/model/Hero";
import { requireAdmin } from "@/app/lib/requireAdmin";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const slides = await Hero.find({ isActive: true }).sort({ order: 1 });
        return NextResponse.json(slides);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch slides" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { error: authError } = await requireAdmin();
        if (authError) return authError;

        await connectDB();
        const body = await req.json();

        const newSlide = await Hero.create(body);
        return NextResponse.json(newSlide, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
