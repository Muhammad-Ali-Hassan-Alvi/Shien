import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between mt-4 text-sm select-none">
            <div className="text-gray-500">
                Page <span className="font-bold text-black">{currentPage}</span> of <span className="font-bold text-black">{totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
