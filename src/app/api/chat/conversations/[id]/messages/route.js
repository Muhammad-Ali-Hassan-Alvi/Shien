import { NextResponse } from "next/server";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import { canAccessTicket, resolveChatIdentity } from "@/app/lib/chatAuth";
import {
    createUserNotification,
    notifyAllAdmins,
} from "@/lib/notificationService";
import { emitChatMessage, emitChatListUpdate } from "@/lib/socket-server";

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const identity = await resolveChatIdentity(req);
        if (!identity) {
            return NextResponse.json({ error: "Chat session required" }, { status: 401 });
        }

        const { message: rawMessage, sender: requestedSender } = await req.json();
        const message = String(rawMessage || "").trim();
        if (!message) {
            return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
        }

        let sender = "user";
        if (requestedSender === "admin" && identity.role === "admin") {
            sender = "admin";
        } else if (identity.type !== "user" && identity.role !== "admin") {
            sender = "user";
        } else if (identity.role === "admin" && requestedSender !== "user") {
            sender = "admin";
        }

        await connectDB();
        const ticket = await Ticket.findById(id);
        if (!ticket || !canAccessTicket(ticket, identity)) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        if (sender === "user" && identity.role !== "admin") {
            if (identity.type === "user" && String(ticket.user) !== String(identity.userId)) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
            if (
                identity.type === "guest" &&
                ticket.guestSessionId !== identity.guestSessionId
            ) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
        }

        const newMessage = {
            sender,
            message,
            createdAt: new Date(),
        };

        ticket.messages.push(newMessage);

        if (sender === "admin" && ticket.status === "Open") {
            ticket.status = "In Progress";
        }
        if (sender === "user" && ticket.status === "Resolved") {
            ticket.status = "Open";
        }

        await ticket.save();

        const payload = {
            sender: newMessage.sender,
            message: newMessage.message,
            createdAt: newMessage.createdAt,
        };

        if (sender === "admin" && ticket.user) {
            try {
                await createUserNotification({
                    userId: ticket.user,
                    type: "TicketReply",
                    message: "Support replied to your live chat",
                    link: `/profile/help-center/${ticket._id}`,
                });
            } catch (e) {
                console.error("Chat reply notification failed:", e);
            }
        }

        if (sender === "user") {
            try {
                await notifyAllAdmins({
                    type: "TicketUpdate",
                    message: `New message on live chat: "${ticket.subject}"`,
                    link: `/seller-center/help-center/${ticket._id}`,
                });
            } catch (e) {
                console.error("Admin chat update notification failed:", e);
            }
        }

        emitChatMessage(String(ticket._id), payload);
        emitChatListUpdate({ ticketId: String(ticket._id), action: "message" });

        return NextResponse.json({ message: payload });
    } catch (error) {
        console.error("[chat/messages POST]", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
