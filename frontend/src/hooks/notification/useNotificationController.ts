import { useState, useCallback, useEffect } from 'react';
import { useNotificationStore } from '../../stores/notification';
import type { NotificationRepository } from '../../repositories/notification';
import { AppError } from '../../utils/appError';
import type { ErrorInfo, SuccessInfo } from '../../models/api';

export const createNotificationController = ({ repository }: { repository: NotificationRepository }) => {
  return () => {
    // Store state
    const {
      notifications,
      unreadCount,
      loading: storeLoading,
      setNotifications,
      markAsRead: storeMarkAsRead,
      markAllAsRead: storeMarkAllAsRead,
      deleteNotification: storeDeleteNotification,
      deleteAllRead: storeDeleteAllRead,
      setLoading: setStoreLoading,
    } = useNotificationStore();

    // Local state
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [success, setSuccess] = useState<SuccessInfo | null>(null);

    // Fetch all notifications
    const fetchNotifications = useCallback(async (): Promise<boolean> => {
      try {
        setStoreLoading(true);
        setError(null);
        setSuccess(null);

        const notificationsData = await repository.getNotifications();
        setNotifications(notificationsData);
        
        return true;
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error('[useNotification] Fetch notifications error:', err.message);
          setError({
            title: err.title,
            message: err.message,
            subtitle: err.subtitle,
          });
          return false;
        }
        
        setError({ message: err?.message || 'Failed to fetch notifications', title: 'Error' });
        return false;
      } finally {
        setStoreLoading(false);
      }
    }, [repository, setNotifications, setStoreLoading]);

    // Mark a specific notification as read
    const markAsRead = useCallback(async (notificationId: number): Promise<boolean> => {
      try {
        setError(null);
        setSuccess(null);

        await repository.markAsRead(notificationId);
        storeMarkAsRead(notificationId);
        
        return true;
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error('[useNotification] Mark as read error:', err.message);
          setError({
            title: err.title,
            message: err.message,
            subtitle: err.subtitle,
          });
          return false;
        }
        
        setError({ message: err?.message || 'Failed to mark notification as read', title: 'Error' });
        return false;
      }
    }, [repository, storeMarkAsRead]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async (): Promise<boolean> => {
      try {
        setError(null);
        setSuccess(null);

        await repository.markAllAsRead();
        storeMarkAllAsRead();
        // setSuccess({ message: 'All notifications marked as read' });
        
        return true;
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error('[useNotification] Mark all as read error:', err.message);
          setError({
            title: err.title,
            message: err.message,
            subtitle: err.subtitle,
          });
          return false;
        }
        
        setError({ message: err?.message || 'Failed to mark all notifications as read', title: 'Error' });
        return false;
      }
    }, [repository, storeMarkAllAsRead]);

    // Delete a specific notification
    const deleteNotification = useCallback(async (notificationId: number): Promise<boolean> => {
      try {
        setError(null);
        setSuccess(null);

        await repository.deleteNotification(notificationId);
        storeDeleteNotification(notificationId);
        // setSuccess({ message: 'Notification deleted' });
        
        return true;
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error('[useNotification] Delete notification error:', err.message);
          setError({
            title: err.title,
            message: err.message,
            subtitle: err.subtitle,
          });
          return false;
        }
        
        setError({ message: err?.message || 'Failed to delete notification', title: 'Error' });
        return false;
      }
    }, [repository, storeDeleteNotification]);

    // Delete all read notifications
    const deleteAllRead = useCallback(async (): Promise<boolean> => {
      try {
        setError(null);
        setSuccess(null);

        await repository.deleteAllRead();
        storeDeleteAllRead();
        // setSuccess({ message: 'All read notifications deleted' });
        
        return true;
      } catch (err: any) {
        if (err instanceof AppError) {
          console.error('[useNotification] Delete all read error:', err.message);
          setError({
            title: err.title,
            message: err.message,
            subtitle: err.subtitle,
          });
          return false;
        }
        
        setError({ message: err?.message || 'Failed to delete read notifications', title: 'Error' });
        return false;
      }
    }, [repository, storeDeleteAllRead]);

    // Auto-fetch notifications on mount
    useEffect(() => {
      fetchNotifications();
    }, [fetchNotifications]);

    return {
      // State
      notifications,
      unreadCount,
      loading: storeLoading,
      error,
      success,
      
      // Actions
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllRead,
      setError,
      setSuccess,
    };
  };
};

export type NotificationController = ReturnType<ReturnType<typeof createNotificationController>>;
