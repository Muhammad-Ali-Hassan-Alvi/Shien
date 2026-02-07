import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
    unreadCount: 0,
    isOpen: false,
    notifications: [],

    setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
    }),

    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen) => set({ isOpen }),

    markAllRead: () => set((state) => {
        const updated = state.notifications.map(n => ({ ...n, isRead: true }));
        return { notifications: updated, unreadCount: 0 };
    }),

    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        isOpen: true // Auto open on new notif
    })),
}));
