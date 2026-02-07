import connectDB from "@/app/lib/config/db";
import Notification from "@/app/lib/model/Notification";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();

        if (!session?.user?.id) return NextResponse.json({ notifications: [] });

        const notifications = await Notification.find({ user: session.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({ notifications });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const session = await auth();

        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await Notification.updateMany(
            { user: session.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
