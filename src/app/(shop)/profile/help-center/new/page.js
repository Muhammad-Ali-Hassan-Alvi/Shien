
"use client";

import { useState } from "react";
import { createTicket } from "@/app/lib/help-actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import StyledSelect from "@/components/ui/StyledSelect";

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [priority, setPriority] = useState("Medium");

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.target);
        const res = await createTicket(null, formData);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Request submitted successfully!");
            router.push(`/profile/help-center/${res.ticketId}`);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50/50">
            <Link href="/profile/help-center" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8 transition-colors">
                <ArrowLeft size={16} /> Back to Help Center
            </Link>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-playfair font-black text-gray-900">Submit a Request</h1>
                    <p className="text-gray-500 font-medium mt-1">Describe your issue and we'll get back to you shortly.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subject</label>
                        <input
                            name="subject"
                            type="text"
                            placeholder="e.g. Order #1234 Status, Incorrect Item, Returns..."
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 font-medium text-gray-900 placeholder:text-gray-400 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Order ID (Optional)</label>
                        <input
                            name="orderId"
                            type="text"
                            placeholder="If related to an order"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 font-medium text-gray-900 placeholder:text-gray-400 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Priority</label>
                            <StyledSelect
                                name="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                options={["Low", "Medium", "High"]}
                                variant="priority"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Message</label>
                        <textarea
                            name="message"
                            rows={6}
                            placeholder="Please provide details about your inquiry..."
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 font-medium text-gray-900 placeholder:text-gray-400 transition-all resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-900 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
