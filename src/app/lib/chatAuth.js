import { auth } from "@/auth";

export function getGuestSessionFromRequest(req) {
    return (
        req.headers.get("x-chat-session")?.trim() ||
        req.headers.get("X-Chat-Session")?.trim() ||
        ""
    );
}

export async function resolveChatIdentity(req) {
    const session = await auth();
    if (session?.user?.id) {
        return {
            type: "user",
            userId: session.user.id,
            role: session.user.role || "user",
            name: session.user.name || "",
            email: session.user.email || "",
        };
    }

    const guestSessionId = getGuestSessionFromRequest(req);
    if (guestSessionId) {
        return { type: "guest", guestSessionId, role: "guest" };
    }

    return null;
}

export function canAccessTicket(ticket, identity) {
    if (!ticket || !identity) return false;
    if (identity.role === "admin") return true;

    if (identity.type === "user" && ticket.user) {
        return String(ticket.user) === String(identity.userId);
    }

    if (identity.type === "guest" && ticket.guestSessionId) {
        return ticket.guestSessionId === identity.guestSessionId;
    }

    return false;
}

export function ticketContactLabel(ticket) {
    if (ticket.user?.name) return ticket.user.name;
    if (ticket.guestName) return ticket.guestName;
    return "Customer";
}

export function ticketContactEmail(ticket) {
    if (ticket.user?.email) return ticket.user.email;
    return ticket.guestEmail || "";
}
