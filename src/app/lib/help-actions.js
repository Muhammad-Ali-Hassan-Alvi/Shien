"use server";

import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import {
    createUserNotification,
    notifyAllAdmins,
} from "@/lib/notificationService";
import { revalidatePath } from "next/cache";
import { emitChatMessage, emitChatListUpdate } from "@/lib/socket-server";

/* --- User Actions --- */

export async function createTicket(prevState, formData) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        const user = session.user.id;
        const subject = formData.get("subject");
        const orderId = formData.get("orderId");
        const message = formData.get("message");
        const priority = formData.get("priority") || "Medium";

        if (!subject || !message) {
            return { error: "Subject and Message are required" };
        }

        await connectDB();

        const newTicket = new Ticket({
            user,
            subject,
            order: orderId ? orderId : null,
            priority,
            messages: [
                {
                    sender: "user",
                    message,
                    createdAt: new Date(),
                },
            ],
        });

        await newTicket.save();

        try {
            await notifyAllAdmins({
                type: "NewTicket",
                message: `New help ticket: "${subject}"`,
                link: `/seller-center/help-center/${newTicket._id}`,
            });
        } catch (e) {
            console.error("Admin ticket notification failed:", e);
        }

        revalidatePath("/profile/help-center");
        return { success: true, ticketId: newTicket._id.toString() };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create ticket" };
    }
}

export async function replyToTicket(ticketId, message, sender = "user") {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        if (!message) return { error: "Message cannot be empty" };

        await connectDB();

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return { error: "Ticket not found" };

        if (sender === "user" && ticket.user.toString() !== session.user.id.toString()) {
            return { error: "Unauthorized" };
        }

        if (sender === "admin" && session.user.role !== "admin") {
            return { error: "Unauthorized" };
        }

        ticket.messages.push({
            sender,
            message,
            createdAt: new Date(),
        });

        if (sender === "admin") {
            if (ticket.status === "Open") ticket.status = "In Progress";

            try {
                await createUserNotification({
                    userId: ticket.user,
                    type: "TicketReply",
                    message: `Support replied to your ticket: "${ticket.subject}"`,
                    link: `/profile/help-center/${ticket._id}`,
                });
            } catch (notiError) {
                console.error("Failed to create notification", notiError);
            }
        }

        if (sender === "user") {
            if (ticket.status === "Resolved") ticket.status = "Open";

            try {
                await notifyAllAdmins({
                    type: "TicketUpdate",
                    message: `Customer replied on ticket: "${ticket.subject}"`,
                    link: `/seller-center/help-center/${ticketId}`,
                });
            } catch (e) {
                console.error("Admin ticket update notification failed:", e);
            }
        }

        await ticket.save();

        const lastMessage = ticket.messages[ticket.messages.length - 1];
        if (ticket.channel === "live-chat" && lastMessage) {
            emitChatMessage(String(ticket._id), {
                sender: lastMessage.sender,
                message: lastMessage.message,
                createdAt: lastMessage.createdAt,
            });
            emitChatListUpdate({ ticketId: String(ticket._id), action: "message" });
        }

        revalidatePath(`/profile/help-center/${ticketId}`);
        revalidatePath(`/seller-center/help-center/${ticketId}`);

        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to send reply" };
    }
}

/* --- Admin Actions --- */

export async function updateTicketStatus(ticketId, status) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") return { error: "Unauthorized" };

        await connectDB();
        const ticket = await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
        if (!ticket) return { error: "Ticket not found" };

        try {
            await createUserNotification({
                userId: ticket.user,
                type: "TicketStatus",
                message: `Your ticket "${ticket.subject}" is now ${status}`,
                link: `/profile/help-center/${ticketId}`,
            });
        } catch (e) {
            console.error("Ticket status notification failed:", e);
        }

        revalidatePath(`/seller-center/help-center`);
        revalidatePath(`/profile/help-center/${ticketId}`);

        return { success: true };
    } catch (e) {
        return { error: "Failed update" };
    }
}
