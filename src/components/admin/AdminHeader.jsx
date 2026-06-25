"use client";

import { useState } from "react";
import { Bell, Search, User, Menu, LogOut, Trash2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";

export default function AdminHeader({ onMenuClick }) {
    const { data: session } = useSession();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const {
        notifications,
        unreadCount,
        markAllRead,
        removeNotification,
        removeAllNotifications,
    } = useNotifications();

    const handleToggleNotifications = () => {
        const opening = !showNotifications;
        setShowNotifications(opening);
        if (opening && unreadCount > 0) {
            markAllRead();
        }
    };

    const adminName = session?.user?.name || "Guest";
    const isAdmin = session?.user?.role === "admin";
    const adminRole = isAdmin ? "Administrator" : session?.user ? "Staff" : "Not signed in";

    return (
        <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 sticky top-0 z-30 shrink-0">
            <button
                type="button"
                onClick={onMenuClick}
                className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg shrink-0"
                aria-label="Open menu"
            >
                <Menu size={22} />
            </button>

            <div className="flex-1 min-w-0 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowMobileSearch((v) => !v)}
                    className="sm:hidden p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg shrink-0"
                    aria-label="Search"
                >
                    <Search size={20} />
                </button>

                <div
                    className={`relative flex-1 min-w-0 ${showMobileSearch ? "block" : "hidden sm:block"} max-w-full sm:max-w-md`}
                >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    <input
                        type="search"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none outline-none rounded-lg text-sm focus:ring-1 focus:ring-black/10"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="relative">
                    <button
                        type="button"
                        onClick={handleToggleNotifications}
                        className="relative p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <button
                                type="button"
                                className="fixed inset-0 z-40 sm:hidden"
                                aria-label="Close notifications"
                                onClick={() => setShowNotifications(false)}
                            />
                            <div className="fixed left-3 right-3 top-[3.75rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-[70vh] overflow-hidden flex flex-col">
                                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center shrink-0 gap-2">
                                    <h3 className="font-bold text-sm">Notifications</h3>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">
                                                {unreadCount} New
                                            </span>
                                        )}
                                        {notifications.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={removeAllNotifications}
                                                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                                title="Clear all"
                                                aria-label="Clear all notifications"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                                    {notifications.length === 0 ? (
                                        <p className="px-4 py-8 text-sm text-gray-400 text-center">No notifications yet</p>
                                    ) : (
                                        notifications.map((notif) => (
                                            <NotificationItem
                                                key={notif._id}
                                                notification={notif}
                                                onRemove={removeNotification}
                                                onNavigate={() => setShowNotifications(false)}
                                                compact
                                            />
                                        ))
                                    )}
                                </div>
                                <div className="px-4 py-2 border-t border-gray-100 shrink-0">
                                    <Link
                                        href="/seller-center/notifications"
                                        onClick={() => setShowNotifications(false)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                    >
                                        View all notifications →
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="relative group pl-2 sm:pl-4 border-l border-gray-100">
                    <button
                        type="button"
                        className="flex items-center gap-2 sm:gap-3 outline-none rounded-lg hover:bg-gray-50 p-1 sm:p-0"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-gray-900 leading-none">{adminName}</p>
                            <p className="text-xs text-gray-500 mt-1">{adminRole}</p>
                        </div>
                        <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white shrink-0">
                            <User size={18} />
                        </div>
                    </button>

                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 md:group-focus-within:visible md:group-focus-within:opacity-100 transition-all z-50 hidden sm:block">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <Link href="/seller-center/settings" className="text-sm font-bold block hover:text-indigo-600">
                                My Account
                            </Link>
                        </div>
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/admin/login" })}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
