"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useSocket } from "@/context/SocketProvider";

/**
 * Real-time notifications via Socket.IO with fast polling fallback.
 */
export function useNotifications({ autoOpenOnSale = false, onAutoOpen, limit = 30 } = {}) {
    const { data: session } = useSession();
    const { socket, connected } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const pollRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch(`/api/notifications?limit=${limit}`);
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                const unread = data.notifications.filter((n) => !n.isRead).length;
                setUnreadCount(unread);

                if (autoOpenOnSale && data.notifications.some((n) => !n.isRead && n.type === "Sale")) {
                    onAutoOpen?.();
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, [session?.user?.id, autoOpenOnSale, onAutoOpen, limit]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [session?.user?.id, fetchNotifications]);

    // Fast polling fallback — keeps working even if socket drops silently
    useEffect(() => {
        if (!session?.user?.id) return;

        const intervalMs = connected ? 15000 : 4000;
        pollRef.current = setInterval(fetchNotifications, intervalMs);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [session?.user?.id, connected, fetchNotifications]);

    useEffect(() => {
        if (!socket) return;

        const onNotification = (notification) => {
            setNotifications((prev) => {
                const exists = prev.some((n) => n._id === notification._id);
                if (exists) return prev;
                return [notification, ...prev].slice(0, 30);
            });
            setUnreadCount((c) => c + 1);

            toast(notification.message, {
                icon: "🔔",
                duration: 4000,
            });

            if (autoOpenOnSale && notification.type === "Sale" && !notification.isRead) {
                onAutoOpen?.();
            }
        };

        const onRefresh = async () => {
            if (!session?.user?.id) return;
            try {
                const res = await fetch(`/api/notifications?limit=${limit}`);
                const data = await res.json();
                if (!data.notifications) return;

                setNotifications((prev) => {
                    const prevIds = new Set(prev.map((n) => n._id));
                    const incoming = data.notifications;
                    const brandNew = incoming.filter((n) => !prevIds.has(n._id) && !n.isRead);
                    if (brandNew.length > 0) {
                        brandNew.forEach((n) => {
                            toast(n.message, { icon: "🔔", duration: 4000 });
                        });
                    }
                    return incoming;
                });
                const unread = data.notifications.filter((n) => !n.isRead).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error("Failed to refresh notifications", error);
            }
        };

        socket.on("notification", onNotification);
        socket.on("notifications:refresh", onRefresh);

        return () => {
            socket.off("notification", onNotification);
            socket.off("notifications:refresh", onRefresh);
        };
    }, [socket, autoOpenOnSale, onAutoOpen, fetchNotifications]);

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", { method: "PUT" });
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark notifications read", error);
        }
    };

    const removeNotification = async (id) => {
        const target = notifications.find((n) => n._id === id);
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");

            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (target && !target.isRead) {
                setUnreadCount((c) => Math.max(0, c - 1));
            }
        } catch (error) {
            console.error("Failed to delete notification", error);
            toast.error("Could not remove notification");
        }
    };

    const removeAllNotifications = async () => {
        try {
            const res = await fetch("/api/notifications", { method: "DELETE" });
            if (!res.ok) throw new Error("Clear failed");

            setNotifications([]);
            setUnreadCount(0);
            toast.success("All notifications cleared");
        } catch (error) {
            console.error("Failed to clear notifications", error);
            toast.error("Could not clear notifications");
        }
    };

    return {
        notifications,
        unreadCount,
        markAllRead,
        removeNotification,
        removeAllNotifications,
        refetch: fetchNotifications,
        connected,
    };
}
