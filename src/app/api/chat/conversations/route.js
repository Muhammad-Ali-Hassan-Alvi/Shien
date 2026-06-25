import { NextResponse } from "next/server";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import { resolveChatIdentity } from "@/app/lib/chatAuth";
import { notifyAllAdmins } from "@/lib/notificationService";
import { emitChatMessage, emitChatListUpdate } from "@/lib/socket-server";

export async function GET(req) {
    try {
        const identity = await resolveChatIdentity(req);
        if (!identity) {
            return NextResponse.json({ error: "Chat session required" }, { status: 401 });
        }

        await connectDB();

        const query =
            identity.type === "user"
                ? { user: identity.userId, channel: "live-chat" }
                : { guestSessionId: identity.guestSessionId, channel: "live-chat" };

        const tickets = await Ticket.find(query)
            .sort({ updatedAt: -1 })
            .select("subject status messages updatedAt createdAt")
            .lean();

        const conversations = tickets.map((t) => ({
            _id: String(t._id),
            subject: t.subject,
            status: t.status,
            updatedAt: t.updatedAt,
            createdAt: t.createdAt,
            lastMessage: t.messages?.[t.messages.length - 1] || null,
            messageCount: t.messages?.length || 0,
        }));

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("[chat/conversations GET]", error);
        return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const identity = await resolveChatIdentity(req);
        if (!identity) {
            return NextResponse.json({ error: "Chat session required" }, { status: 401 });
        }

        const body = await req.json();
        const message = String(body.message || "").trim();
        const guestName = String(body.guestName || "").trim();
        const guestEmail = String(body.guestEmail || "").trim().toLowerCase();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (identity.type === "guest") {
            if (!guestName || !guestEmail) {
                return NextResponse.json(
                    { error: "Name and email are required to start a chat" },
                    { status: 400 }
                );
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
                return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
            }
        }

        await connectDB();

        const subject =
            message.length > 60 ? `${message.slice(0, 57)}...` : message;

        const ticketData = {
            subject: `Chat: ${subject}`,
            channel: "live-chat",
            priority: "Medium",
            messages: [
                {
                    sender: "user",
                    message,
                    createdAt: new Date(),
                },
            ],
        };

        if (identity.type === "user") {
            ticketData.user = identity.userId;
        } else {
            ticketData.guestName = guestName;
            ticketData.guestEmail = guestEmail;
            ticketData.guestSessionId = identity.guestSessionId;
        }

        const ticket = await Ticket.create(ticketData);
        const serialized = JSON.parse(JSON.stringify(ticket));

        try {
            await notifyAllAdmins({
                type: "NewTicket",
                message: `New live chat from ${guestName || identity.name || "Customer"}`,
                link: `/seller-center/help-center/${ticket._id}`,
            });
        } catch (e) {
            console.error("Admin chat notification failed:", e);
        }

        emitChatListUpdate({ ticketId: String(ticket._id), action: "new" });
        emitChatMessage(String(ticket._id), serialized.messages[0]);

        return NextResponse.json({
            conversation: {
                _id: String(ticket._id),
                subject: ticket.subject,
                status: ticket.status,
                messages: serialized.messages,
                updatedAt: ticket.updatedAt,
            },
        });
    } catch (error) {
        console.error("[chat/conversations POST]", error);
        return NextResponse.json({ error: "Failed to start conversation" }, { status: 500 });
    }
}
