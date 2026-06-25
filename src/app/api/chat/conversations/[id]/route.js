import { NextResponse } from "next/server";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import { canAccessTicket, resolveChatIdentity } from "@/app/lib/chatAuth";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const identity = await resolveChatIdentity(req);
        if (!identity) {
            return NextResponse.json({ error: "Chat session required" }, { status: 401 });
        }

        await connectDB();
        const ticket = await Ticket.findById(id).lean();
        if (!ticket || !canAccessTicket(ticket, identity)) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        return NextResponse.json({
            conversation: {
                _id: String(ticket._id),
                subject: ticket.subject,
                status: ticket.status,
                messages: ticket.messages || [],
                updatedAt: ticket.updatedAt,
                guestName: ticket.guestName,
                guestEmail: ticket.guestEmail,
            },
        });
    } catch (error) {
        console.error("[chat/conversation GET]", error);
        return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
    }
}
