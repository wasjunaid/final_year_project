import type { NotificationModel } from '../../models/notification/model';
import { transformNotificationDtoArray } from '../../models/notification/transformers';
import { AppError } from '../../utils/appError';

// Factory to create notification repository with DI for service - enables testing with mock services
export const createNotificationRepository = ({ notificationService }: { notificationService: any }) => {
  return {
    // Get all notifications for the authenticated user
    async getNotifications(): Promise<NotificationModel[]> {
      try {
        const response = await notificationService.getNotifications();

        if (!response.success || !response.data) {
          console.log('[Notification Repository] No notifications found');
          return [];
        }

        return transformNotificationDtoArray(response.data);
      } catch (error: any) {
        // if error is 404 (not found), return empty array
        if (error.response?.status === 404) {
          console.log('[Notification Repository] No notifications found (404)');
          return [];
        }

        // If it's already an AppError, just throw it
        if (error instanceof AppError) {
          throw error;
        }
        
        // Check if it's an axios error with a response
        if (error.response?.data) {
          const errorData = error.response.data;
          console.error('[Notification Repository] Get notifications error:', errorData.message);
          throw new AppError({ message: errorData.message || 'Failed to fetch notifications', title: 'Error' });
        }
        
        console.error('[Notification Repository] Unexpected error:', error);
        throw error;
      }
    },

    // Mark a specific notification as read
    async markAsRead(notificationId: number): Promise<void> {
      try {
        const response = await notificationService.markAsRead(notificationId);

        if (!response.success) {
          console.error('[Notification Repository] Failed to mark notification as read:', notificationId);
          throw new AppError({ message: response.message || 'Failed to mark notification as read', title: 'Error' });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        if (error.response?.data) {
          const errorData = error.response.data;
          console.error('[Notification Repository] Mark as read error:', errorData.message);
          throw new AppError({ message: errorData.message || 'Failed to mark notification as read', title: 'Error' });
        }
        
        console.error('[Notification Repository] Unexpected error:', error);
        throw error;
      }
    },

    // Mark all notifications as read
    async markAllAsRead(): Promise<void> {
      try {
        const response = await notificationService.markAllAsRead();

        if (!response.success) {
          console.error('[Notification Repository] Failed to mark all notifications as read');
          throw new AppError({ message: response.message || 'Failed to mark all notifications as read', title: 'Error' });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        if (error.response?.data) {
          const errorData = error.response.data;
          console.error('[Notification Repository] Mark all as read error:', errorData.message);
          throw new AppError({ message: errorData.message || 'Failed to mark all notifications as read', title: 'Error' });
        }
        
        console.error('[Notification Repository] Unexpected error:', error);
        throw error;
      }
    },

    // Delete a specific notification
    async deleteNotification(notificationId: number): Promise<void> {
      try {
        const response = await notificationService.deleteNotification(notificationId);

        if (!response.success) {
          console.error('[Notification Repository] Failed to delete notification:', notificationId);
          throw new AppError({ message: response.message || 'Failed to delete notification', title: 'Error' });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        if (error.response?.data) {
          const errorData = error.response.data;
          console.error('[Notification Repository] Delete notification error:', errorData.message);
          throw new AppError({ message: errorData.message || 'Failed to delete notification', title: 'Error' });
        }
        
        console.error('[Notification Repository] Unexpected error:', error);
        throw error;
      }
    },

    // Delete all read notifications
    async deleteAllRead(): Promise<void> {
      try {
        const response = await notificationService.deleteAllRead();

        if (!response.success) {
          console.error('[Notification Repository] Failed to delete all read notifications');
          throw new AppError({ message: response.message || 'Failed to delete all read notifications', title: 'Error' });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        if (error.response?.data) {
          const errorData = error.response.data;
          console.error('[Notification Repository] Delete all read error:', errorData.message);
          throw new AppError({ message: errorData.message || 'Failed to delete all read notifications', title: 'Error' });
        }
        
        console.error('[Notification Repository] Unexpected error:', error);
        throw error;
      }
    },
  };
};

export type NotificationRepository = ReturnType<typeof createNotificationRepository>;
