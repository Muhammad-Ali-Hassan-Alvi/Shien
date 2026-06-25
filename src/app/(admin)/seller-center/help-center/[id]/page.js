import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Calendar, WifiOff } from "lucide-react";
import AdminChatInterface from "./AdminChatInterface";
import StatusBadge from "@/components/ui/StatusBadge";
import TicketStatusSelect from "@/components/admin/TicketStatusSelect";

async function getTicket(id) {
    await connectDB();
    const ticket = await Ticket.findById(id).populate("user");
    return ticket ? JSON.parse(JSON.stringify(ticket)) : null;
}

function DbErrorPanel({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <WifiOff className="text-red-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Database Unavailable</h2>
            <p className="text-gray-500 max-w-md mb-6 text-sm">
                {message ||
                    "Could not connect to MongoDB. Check your internet connection, restart the dev server, and verify MONGODB_URL in .env.local."}
            </p>
            <div className="flex gap-3">
                <Link
                    href="/seller-center/help-center"
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                >
                    Back to Tickets
                </Link>
                <Link
                    href="/seller-center/help-center"
                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800"
                >
                    Retry
                </Link>
            </div>
        </div>
    );
}

export default async function AdminTicketDetailPage({ params }) {
    const { id } = await params;

    let ticket;
    let dbError = null;

    try {
        ticket = await getTicket(id);
    } catch (err) {
        console.error("Help center ticket fetch failed:", err?.message);
        dbError = err?.message?.includes("ENOTFOUND")
            ? "MongoDB hostname could not be resolved (DNS error). Restart your dev server and check your network connection."
            : err?.message || "Database connection failed.";
    }

    if (dbError) {
        return (
            <div className="space-y-6">
                <Link
                    href="/seller-center/help-center"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Tickets
                </Link>
                <DbErrorPanel message={dbError} />
            </div>
        );
    }

    if (!ticket) redirect("/seller-center/help-center");

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <Link
                    href="/seller-center/help-center"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Tickets
                </Link>
                <div className="text-xs text-gray-400 font-mono">ID: {ticket._id}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-2 flex flex-col h-[calc(100vh-140px)]">
                    <div className="bg-white px-6 py-4 border border-b-0 border-gray-200 rounded-t-xl flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-900">{ticket.subject}</h2>
                        <StatusBadge status={ticket.status} />
                    </div>
                    <AdminChatInterface ticket={ticket} />
                </div>

                <div className="space-y-6 h-fit">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                            Customer Details
                        </h3>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                {ticket.user?.name?.[0] || ticket.guestName?.[0] || "G"}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 leading-tight">
                                    {ticket.user?.name || ticket.guestName || "Guest"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {ticket.channel === "live-chat" ? "Live Chat" : ticket.user?.role || "Guest"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail size={16} className="text-gray-400" />
                                <span className="truncate">
                                    {ticket.user?.email || ticket.guestEmail || "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Phone size={16} className="text-gray-400" />
                                <span>{ticket.user?.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Calendar size={16} className="text-gray-400" />
                                <span>
                                    Joined:{" "}
                                    {ticket.user?.createdAt
                                        ? new Date(ticket.user.createdAt).toLocaleDateString()
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                            Ticket Actions
                        </h3>
                        <div className="space-y-3">
                            <p className="text-xs text-gray-500 font-medium">Change Status</p>
                            <TicketStatusSelect ticketId={ticket._id} initialStatus={ticket.status} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
