import { create } from 'zustand';

export interface Notification {
    id: string;
    type: 'low_stock' | 'out_of_stock' | 'new_order' | 'info';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: Date;
}

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

export const useNotifications = create<NotificationsState>((set, get) => ({
    notifications: [],
    unreadCount: 0,

    setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
    }),

    addNotification: (notification) => {
        const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substring(7),
            read: false,
            createdAt: new Date(),
        };
        set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
    })),

    clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
