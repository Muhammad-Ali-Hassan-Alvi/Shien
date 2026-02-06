"use client";
import { Search, Mail, Phone, Calendar } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/admin/Pagination";

export default function CustomersTable({ customers }) {
   const [search, setSearch] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const ITEMS_PER_PAGE = 10;

   const filtered = customers.filter(c => 
      (c.name?.toLowerCase().includes(search.toLowerCase()) || 
      c.email?.toLowerCase().includes(search.toLowerCase()))
   );

   const paginatedCustomers = filtered.slice(
       (currentPage - 1) * ITEMS_PER_PAGE,
       currentPage * ITEMS_PER_PAGE
   );

   const handlePageChange = (p) => {
       setCurrentPage(p);
   };

   return (
     <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-1">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4">
             <h2 className="font-bold text-lg">All Customers ({customers.length})</h2>
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1); // Reset to page 1 on search
                    }}
                    placeholder="Search customers..." 
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-black"
                 />
             </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm text-left min-w-[800px]">
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
                                    <span className="flex items-center gap-2"><Mail size={12}/> {customer.email || "N/A"}</span>
                                    {customer.phone && <span className="flex items-center gap-2"><Phone size={12}/> {customer.phone}</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                <span className="flex items-center gap-2"><Calendar size={12}/> {new Date(customer.createdAt).toLocaleDateString()}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${customer.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {customer.role || 'user'}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No customers found.</td>
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
                    onPageChange={handlePageChange}
                />
            </div>
        )}
     </div>
   );
}
