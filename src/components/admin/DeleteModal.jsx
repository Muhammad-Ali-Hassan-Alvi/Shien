"use client";

import { AlertTriangle } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title || "Are you sure?"}</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        {message || "This action cannot be undone."}
                    </p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
