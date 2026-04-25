import { create } from 'zustand';
import type { NotificationModel } from '../../models/notification';

export interface NotificationState {
  // State
  notifications: NotificationModel[];
  unreadCount: number;
  loading: boolean;
  
  // Actions
  setNotifications: (notifications: NotificationModel[]) => void;
  addNotification: (notification: NotificationModel) => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: number) => void;
  deleteAllRead: () => void;
  setLoading: (loading: boolean) => void;
  clearNotifications: () => void;
}

// Factory to create notification store
export const createNotificationStore = () => {
  return create<NotificationState>((set) => ({
    // Initial state
    notifications: [],
    unreadCount: 0,
    loading: false,

    // Set notifications and calculate unread count
    setNotifications: (notifications) => {
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount });
    },

    // Add a new notification (e.g., from WebSocket/SSE)
    addNotification: (notification) => set((state) => {
      const notifications = [notification, ...state.notifications];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    }),

    // Mark a specific notification as read
    markAsRead: (notificationId) => set((state) => {
      const notifications = state.notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    }),

    // Mark all notifications as read
    markAllAsRead: () => set((state) => {
      const notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      return { notifications, unreadCount: 0 };
    }),

    // Delete a specific notification
    deleteNotification: (notificationId) => set((state) => {
      const notifications = state.notifications.filter(n => n.id !== notificationId);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    }),

    // Delete all read notifications
    deleteAllRead: () => set((state) => {
      const notifications = state.notifications.filter(n => !n.isRead);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    }),

    // Set loading state
    setLoading: (loading) => set({ loading }),

    // Clear all notifications
    clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  }));
};

export type NotificationStore = ReturnType<typeof createNotificationStore>;
