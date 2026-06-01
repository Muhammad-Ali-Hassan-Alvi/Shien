"use client";

import { Bell, Trash2 } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import {
    groupNotificationsByTime,
    NOTIFICATION_TYPE_LABELS,
} from "@/app/lib/notificationUtils";

export default function AdminNotificationsPage() {
    const {
        notifications,
        unreadCount,
        markAllRead,
        removeNotification,
        removeAllNotifications,
        connected,
    } = useNotifications({ limit: 100 });

    const grouped = groupNotificationsByTime(notifications);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Sorted by time — newest first
                        {connected && (
                            <span className="ml-2 text-emerald-600 font-medium">• Live</span>
                        )}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {unreadCount > 0 && (
                        <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            {unreadCount} unread
                        </span>
                    )}
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            type="button"
                            onClick={removeAllNotifications}
                            className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 size={12} />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <Bell size={40} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No notifications yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Order updates, new orders, and support alerts will show up here.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map(([label, items]) => (
                        <section key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {label}
                                </h2>
                                <span className="text-xs text-gray-400">{items.length}</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {items.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className="flex items-stretch hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <NotificationItem
                                                notification={notification}
                                                onRemove={removeNotification}
                                                showFullTime
                                            />
                                        </div>
                                        <div className="hidden sm:flex items-center px-4 shrink-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                {NOTIFICATION_TYPE_LABELS[notification.type] || notification.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-400 text-center">
                Showing your latest {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}.{" "}
                <Link href="/seller-center/orders" className="text-indigo-600 hover:underline">
                    View orders
                </Link>
            </p>
        </div>
    );
}
