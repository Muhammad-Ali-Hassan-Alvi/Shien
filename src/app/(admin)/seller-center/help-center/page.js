
import { auth } from "@/auth";
import connectDB from "@/app/lib/config/db";
import Ticket from "@/app/lib/model/Ticket";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";


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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Tickets</h1>
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                        Total: {tickets.length}
                    </span>
                    <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                        Open: {tickets.filter((t) => t.status === "Open").length}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto overflow-y-visible">
                <div className="admin-table-scroll">
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
                                            <StatusBadge status={ticket.status} size="sm" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={ticket.priority} type="priority" size="sm" />
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
