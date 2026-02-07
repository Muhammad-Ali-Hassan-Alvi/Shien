"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NotificationDropdown() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                const unread = data.notifications.filter(n => !n.isRead).length;
                setUnreadCount(unread);

                // Auto-open logic for Sales!
                // If there's an unread Sale notification, open for 5 seconds
                const hasRecentSale = data.notifications.some(n => !n.isRead && n.type === 'Sale');
                if (hasRecentSale) {
                    setTimeout(() => setIsOpen(true), 500); // Small delay to ensure render
                    setTimeout(() => setIsOpen(false), 5500);
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    // Fetch Notifications on mount if session exists
    useEffect(() => {
        if (session) {
            fetchNotifications();
        }
        // Poll every 30 seconds for new notifications? 
        // Or just on mount. For now, mount is fine.
    }, [session]);

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", { method: "PUT" });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    const toggleOpen = () => {
        if (!isOpen) {
            setIsOpen(true);
            if (unreadCount > 0) markAllRead();
        } else {
            setIsOpen(false);
        }
    };

    if (!session) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleOpen} 
                className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group relative flex items-center justify-center"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-700'} group-hover:text-indigo-600 transition-colors`} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                 <div className="absolute top-full right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                     <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                         <span className="font-bold text-sm text-gray-900">Notifications</span>
                         {unreadCount > 0 && (
                             <button onClick={markAllRead} className="text-xs text-blue-600 font-medium hover:underline">
                                 Mark all read
                             </button>
                         )}
                     </div>
                     <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                         {notifications.length === 0 ? (
                             <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                                 <Bell size={24} className="opacity-20" />
                                 No new notifications
                             </div>
                         ) : (
                             <div className="divide-y divide-gray-50">
                                 {notifications.map(n => (
                                     <Link 
                                        href={n.link || '#'} 
                                        key={n._id}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                                     >
                                         <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                         <div className="flex-1 min-w-0">
                                             <p className={`text-sm leading-tight ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                 {n.message}
                                             </p>
                                             <p className="text-xs text-gray-400 mt-1.5">
                                                 {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                             </p>
                                         </div>
                                     </Link>
                                 ))}
                             </div>
                         )}
                     </div>
                 </div>
            )}
        </div>
    );
}
