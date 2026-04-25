import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { NotificationDto } from '../../models/notification/dto';

// Notification service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const notificationService = {
  // Get all notifications for the authenticated user
  async getNotifications(): Promise<ApiResponse<NotificationDto[]>> {
    const response = await apiClient.get<ApiResponse<NotificationDto[]>>('/notification');
    return response.data;
  },

  // Mark a specific notification as read
  async markAsRead(notificationId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>(`/notification/${notificationId}`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>('/notification');
    return response.data;
  },

  // Delete a specific notification
  async deleteNotification(notificationId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/notification/${notificationId}`);
    return response.data;
  },

  // Delete all notifications
  async deleteAllRead(): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>('/notification');
    return response.data;
  },
};
