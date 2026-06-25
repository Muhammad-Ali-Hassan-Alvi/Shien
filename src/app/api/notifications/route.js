import connectDB from "@/app/lib/config/db";
import Notification from "@/app/lib/model/Notification";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveAdminSession } from "@/app/lib/requireAdmin";
import { getAdminNotificationRecipientIds } from "@/lib/notificationService";

async function getNotificationQuery(session) {
    const adminSession = await resolveAdminSession(session);
    if (adminSession) {
        const recipientIds = await getAdminNotificationRecipientIds(adminSession);
        return { user: { $in: recipientIds } };
    }
    return { user: session.user.id };
}

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();

        if (!session?.user?.id) return NextResponse.json({ notifications: [] });

        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 30, 1), 100);

        const notifications = await Notification.find(await getNotificationQuery(session))
            .sort({ createdAt: -1 })
            .limit(limit);

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
            { ...(await getNotificationQuery(session)), isRead: false },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await Notification.deleteMany(await getNotificationQuery(session));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
