"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { formatRelativeTime } from "@/app/lib/formatRelativeTime";
import { formatNotificationDateTime } from "@/app/lib/notificationUtils";

export default function NotificationItem({
    notification,
    onRemove,
    onNavigate,
    showFullTime = false,
    compact = false,
}) {
    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove?.(notification._id);
    };

    const timeLabel = showFullTime
        ? formatNotificationDateTime(notification.createdAt)
        : formatRelativeTime(notification.createdAt);

    const content = (
        <>
            <div
                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!notification.isRead ? "bg-blue-600" : "bg-transparent"}`}
            />
            <div className="flex-1 min-w-0">
                <p
                    className={`leading-tight ${compact ? "text-sm" : "text-sm"} ${!notification.isRead ? "font-bold text-gray-900" : "text-gray-600"}`}
                >
                    {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">{timeLabel}</p>
            </div>
            {onRemove && (
                <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    aria-label="Remove notification"
                >
                    <X size={14} />
                </button>
            )}
        </>
    );

    if (notification.link) {
        return (
            <Link
                href={notification.link}
                onClick={onNavigate}
                className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors group ${!notification.isRead ? "bg-blue-50/40" : ""}`}
            >
                {content}
            </Link>
        );
    }

    return (
        <div
            className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? "bg-blue-50/40" : ""}`}
        >
            {content}
        </div>
    );
}
