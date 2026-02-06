"use client";

import { HelpCircle } from "lucide-react";

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, isLoading, confirmText = "Confirm" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <HelpCircle size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title || "Confirm Action"}</h3>
                    <div className="text-gray-500 text-sm mb-6 whitespace-pre-line">
                        {message || "Are you sure you want to proceed?"}
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-black/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Processing..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
