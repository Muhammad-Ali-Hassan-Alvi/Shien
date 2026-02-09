
import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Calendar } from "lucide-react";
import AdminChatInterface from "./AdminChatInterface"; // Reusing chat logic but adding admin specifics

async function getTicket(id) {
    await connectDB();
    const ticket = await Ticket.findById(id).populate('user'); // Populate user to see details
    return ticket ? JSON.parse(JSON.stringify(ticket)) : null;
}

export default async function AdminTicketDetailPage({ params }) {
    const { id } = await params; // Await params for Next.js 15+
    const ticket = await getTicket(id);

    if (!ticket) redirect("/seller-center/help-center");

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <Link href="/seller-center/help-center" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft size={16} /> Back to Tickets
                </Link>
                <div className="text-xs text-gray-400 font-mono">
                    ID: {ticket._id}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Available Height Chat Area */}
                <div className="lg:col-span-2 flex flex-col h-[calc(100vh-140px)]">
                    <div className="bg-white px-6 py-4 border border-b-0 border-gray-200 rounded-t-xl flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-900">{ticket.subject}</h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${ticket.status === 'Open' ? 'bg-green-100 text-green-700 border-green-200' :
                            ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                ticket.status === 'Resolved' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                    'bg-red-100 text-red-700 border-red-200'
                            }`}>
                            {ticket.status}
                        </span>
                    </div>
                    {/* Reuse Chat Interface logic but wrapper for admin */}
                    <AdminChatInterface ticket={ticket} />
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6 h-fit">
                    {/* User Info Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Customer Details</h3>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                {ticket.user?.name?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 leading-tight">{ticket.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{ticket.user?.role || 'User'}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail size={16} className="text-gray-400" />
                                <span className="truncate">{ticket.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Phone size={16} className="text-gray-400" />
                                <span>{ticket.user?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Calendar size={16} className="text-gray-400" />
                                <span>Joined: {ticket.user?.createdAt ? new Date(ticket.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Actions Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Ticket Actions</h3>

                        <div className="space-y-3">
                            <p className="text-xs text-gray-500 font-medium">Change Status</p>
                            {/* We need client interactivity here, handled by AdminChatInterface or separate client component */}
                            <AdminChatInterface ticket={ticket} mode="status-only" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
