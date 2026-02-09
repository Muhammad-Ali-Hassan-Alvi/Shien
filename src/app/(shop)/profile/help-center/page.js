
import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import Link from "next/link";
import { Plus, MessageSquare, Clock } from "lucide-react";
import { redirect } from "next/navigation";

async function getTickets() {
    const session = await auth();
    if (!session?.user?.id) return [];

    await connectDB();
    // Sort by updated at desc
    const tickets = await Ticket.find({ user: session.user.id }).sort({ updatedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(tickets));
}

export default async function HelpCenterPage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/login?callbackUrl=/profile/help-center");

    const tickets = await getTickets();

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-playfair font-black text-gray-900">Help Center</h1>
                    <p className="text-gray-500 font-medium mt-1">Need assistance? We're here to help.</p>
                </div>
                <Link
                    href="/profile/help-center/new"
                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={18} /> New Request
                </Link>
            </div>

            {/* Content */}
            {tickets.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Support Requests</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't submitted any support tickets yet. Feel free to contact us if you have any questions!</p>
                    <Link href="/profile/help-center/new" className="text-indigo-600 font-bold hover:underline">
                        Create your first request
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tickets.map(ticket => (
                        <Link
                            key={ticket._id}
                            href={`/profile/help-center/${ticket._id}`}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-gray-200 group relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${ticket.status === 'Open' ? 'bg-green-500' :
                                ticket.status === 'In Progress' ? 'bg-blue-500' :
                                    ticket.status === 'Resolved' ? 'bg-gray-800' : 'bg-gray-300'
                                }`}></div>

                            <div className="flex justify-between items-start mb-2 pl-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {ticket.subject}
                                </h3>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-green-50 text-green-700 border-green-100' :
                                    ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        ticket.status === 'Resolved' ? 'bg-gray-100 text-gray-800 border-gray-200' : 'bg-gray-50 text-gray-500 border-gray-100'
                                    }`}>
                                    {ticket.status}
                                </span>
                            </div>

                            <div className="pl-4 flex items-center gap-6 text-sm text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                </span>
                                <span>{ticket.messages.length} Message{ticket.messages.length !== 1 && 's'}</span>
                                <span className="text-gray-400">ID: #{ticket._id.slice(-6).toUpperCase()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
