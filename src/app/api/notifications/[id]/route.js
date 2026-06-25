import connectDB from "@/app/lib/config/db";
import Notification from "@/app/lib/model/Notification";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveAdminSession } from "@/app/lib/requireAdmin";
import { getAdminNotificationRecipientIds } from "@/lib/notificationService";

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const adminSession = await resolveAdminSession(session);
        const ownerFilter = adminSession
            ? { user: { $in: await getAdminNotificationRecipientIds(adminSession) } }
            : { user: session.user.id };

        const result = await Notification.findOneAndDelete({
            _id: id,
            ...ownerFilter,
        });

        if (!result) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
