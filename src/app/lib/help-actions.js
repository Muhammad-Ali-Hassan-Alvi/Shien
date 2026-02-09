"use server";

import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import { revalidatePath } from "next/cache";

/* --- User Actions --- */

export async function createTicket(prevState, formData) {
    try {
        const session = await auth();
        if (!session?.user) return { error: "Not authenticated" };

        const user = session.user.id;
        const subject = formData.get("subject");
        const orderId = formData.get("orderId"); // Optional
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
                    sender: 'user',
                    message,
                    createdAt: new Date()
                }
            ]
        });

        await newTicket.save();

        revalidatePath("/profile/help-center");
        return { success: true, ticketId: newTicket._id.toString() };

    } catch (e) {
        console.error(e);
        return { error: "Failed to create ticket" };
    }
}

export async function replyToTicket(ticketId, message, sender = 'user') {
    try {
        const session = await auth();
        // Basic check, more robust check would involve checking ticket ownership if sender is user
        if (!session?.user) return { error: "Not authenticated" };

        if (!message) return { error: "Message cannot be empty" };

        await connectDB();

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return { error: "Ticket not found" };

        // Security check: If user, ensure they own the ticket
        if (sender === 'user' && ticket.user.toString() !== session.user.id.toString()) {
            return { error: "Unauthorized" };
        }

        // If admin, ensure they have admin role
        if (sender === 'admin' && session.user.role !== 'admin') {
            return { error: "Unauthorized" };
        }

        ticket.messages.push({
            sender,
            message,
            createdAt: new Date()
        });

        if (sender === 'admin') {
            if (ticket.status === 'Open') ticket.status = 'In Progress';

            // Create Notification for User
            try {
                const Notification = require("@/app/lib/model/Notification").default;
                await Notification.create({
                    user: ticket.user,
                    type: "TicketReply",
                    message: `Support replied to your ticket: "${ticket.subject}"`,
                    link: `/profile/help-center/${ticket._id}`,
                    isRead: false
                });
            } catch (notiError) {
                console.error("Failed to create notification", notiError);
            }
        }

        if (sender === 'user' && ticket.status === 'Resolved') {
            ticket.status = 'Open'; // Re-open if user replies
        }

        await ticket.save();

        revalidatePath(`/profile/help-center/${ticketId}`);
        revalidatePath(`/seller-center/help-center/${ticketId}`); // Admin path

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
        if (session?.user?.role !== 'admin') return { error: "Unauthorized" };

        await connectDB();
        await Ticket.findByIdAndUpdate(ticketId, { status });

        revalidatePath(`/seller-center/help-center`);
        revalidatePath(`/profile/help-center/${ticketId}`); // Update for user view

        return { success: true };
    } catch (e) {
        return { error: "Failed update" };
    }
}
