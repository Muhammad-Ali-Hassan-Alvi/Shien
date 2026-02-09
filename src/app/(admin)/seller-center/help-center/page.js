
import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import Link from "next/link";
import { Mail, messageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";


async function getAdminTickets() {
    await connectDB();
    // Fetch all tickets, populate user details
    const tickets = await Ticket.find({})
        .populate('user', 'name email image')
        .sort({ updatedAt: -1 })
        .lean();
    return JSON.parse(JSON.stringify(tickets));
}

export default async function AdminHelpCenterPage() {
    const session = await auth();
    // if (!session?.user?.role === 'admin') redirect... (Middleware handles this usually)

    const tickets = await getAdminTickets();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                <div className="flex gap-2">
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded">Total: {tickets.length}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded">Open: {tickets.filter(t => t.status === 'Open').length}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-bold">Subject / User</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Priority</th>
                                <th className="px-6 py-4 font-bold">Last Update</th>
                                <th className="px-6 py-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        No tickets found.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map(ticket => (
                                    <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 mb-0.5">{ticket.subject}</span>
                                                <span className="text-xs text-gray-500">
                                                    by {ticket.user?.name || 'Unknown User'} ({ticket.user?.email})
                                                </span>
                                                {ticket.order && (
                                                    <span className="text-[10px] text-indigo-500 font-bold mt-1">
                                                        Order #{ticket.order.toString().slice(-6)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${ticket.status === 'Open' ? 'bg-green-50 text-green-700 border-green-100' :
                                                ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    ticket.status === 'Resolved' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1 font-bold ${ticket.priority === 'High' ? 'text-red-600' :
                                                ticket.priority === 'Medium' ? 'text-yellow-600' : 'text-gray-500'
                                                }`}>
                                                {ticket.priority === 'High' && <AlertCircle size={14} />}
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(ticket.updatedAt).toLocaleDateString()}
                                            <div className="text-xs opacity-70">{new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/seller-center/help-center/${ticket._id}`}
                                                className="inline-flex items-center px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
