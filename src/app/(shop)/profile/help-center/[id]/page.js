
import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import ChatInterface from "./ChatInterface";
import StatusBadge from "@/components/ui/StatusBadge";

// We fetch data in Server Component
async function getTicket(id) {
    const session = await auth();
    if (!session?.user) return null;

    try {
        await connectDB();
        const ticket = await Ticket.findById(id).lean();

        if (!ticket) return null;
        if (ticket.user.toString() !== session.user.id.toString()) return null; // Logic check

        return JSON.parse(JSON.stringify(ticket));
    } catch {
        return null;
    }
}

export default async function TicketDetailPage({ params }) {
    const { id } = await params;
    const ticket = await getTicket(id);

    if (!ticket) redirect("/profile/help-center");

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50/50 flex flex-col">
            <Link href="/profile/help-center" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Help Center
            </Link>

            <div className="bg-white rounded-t-3xl border border-gray-100 shadow-sm p-6 md:p-8 border-b-0 pb-4">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-playfair font-black text-gray-900 mb-2">{ticket.subject}</h1>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-500 flex-wrap">
                            <StatusBadge status={ticket.status} />
                            <span>ID: #{ticket._id.slice(-6).toUpperCase()}</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Interface handled by client component so we can auto-scroll, handle input etc */}
            <ChatInterface ticket={ticket} />
        </div>
    );
}
