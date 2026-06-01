import connectDB from "@/app/lib/config/db";
import Newsletter from "@/app/lib/model/Newsletter";
import { notifyAllAdmins } from "@/lib/notificationService";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email } = await req.json();
        const normalized = email?.trim()?.toLowerCase();

        if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
            return NextResponse.json({ error: "Valid email required" }, { status: 400 });
        }

        await connectDB();

        const existing = await Newsletter.findOne({ email: normalized });
        if (existing) {
            return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
        }

        await Newsletter.create({ email: normalized });

        try {
            await notifyAllAdmins({
                type: "Newsletter",
                message: `New newsletter subscriber: ${normalized}`,
                link: "/seller-center",
            });
        } catch (e) {
            console.error("Newsletter admin notification failed:", e);
        }

        return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
