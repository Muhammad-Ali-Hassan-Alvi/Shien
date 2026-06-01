"use client";

import { Search, Mail, Phone, Calendar, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Pagination from "@/components/admin/Pagination";
import { exportCustomersExcel, exportCustomersPdf } from "@/app/lib/exportUtils";

export default function CustomersTable({ customers }) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const filtered = customers.filter(
        (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedCustomers = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleExportExcel = () => {
        if (!filtered.length) {
            toast.error("No customers to export");
            return;
        }
        exportCustomersExcel(filtered);
        toast.success(`Exported ${filtered.length} customer(s) to Excel`);
    };

    const handleExportPdf = () => {
        if (!filtered.length) {
            toast.error("No customers to export");
            return;
        }
        const opened = exportCustomersPdf(filtered);
        if (!opened) {
            toast.error("Allow pop-ups to export PDF");
            return;
        }
        toast.success("PDF export opened — choose Save as PDF in the print dialog");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto overflow-y-visible p-1">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="font-bold text-base sm:text-lg">
                        All Customers ({customers.length})
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                            <FileSpreadsheet size={14} />
                            Export Excel
                        </button>
                        <button
                            type="button"
                            onClick={handleExportPdf}
                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <FileText size={14} />
                            Export PDF
                        </button>
                    </div>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                    />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search customers..."
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-black"
                    />
                </div>
            </div>
            <div className="admin-table-scroll scrollbar-hide">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginatedCustomers.map((customer, idx) => (
                            <tr key={customer._id || idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                            {customer.name?.[0] || "U"}
                                        </div>
                                        {customer.name || "Unknown"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2">
                                            <Mail size={12} /> {customer.email || "N/A"}
                                        </span>
                                        {customer.phone && (
                                            <span className="flex items-center gap-2">
                                                <Phone size={12} /> {customer.phone}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <span className="flex items-center gap-2">
                                        <Calendar size={12} />{" "}
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            customer.role === "admin"
                                                ? "bg-black text-white"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {customer.role || "user"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filtered.length > 0 && (
                <div className="px-4 pb-4">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filtered.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}
