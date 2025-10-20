import api from "./api";
import EndPoints from "../constants/endpoints";
import type { ApiResponse } from "../models/ApiResponse";
import type { Notification } from "../models/Notification";

class NotificationApi {
  static async getAll(): Promise<ApiResponse<Notification[]>> {
    const response = await api.get(EndPoints.notification.list);
    return response.data;
  }

  static async markAsRead(notificationId: number): Promise<ApiResponse<void>> {
    const response = await api.put(
      EndPoints.notification.markAsRead.replace(
        ":notification_id",
        String(notificationId)
      )
    );
    return response.data;
  }

  static async markAllAsRead(): Promise<ApiResponse<void>> {
    const response = await api.put(EndPoints.notification.markAllAsRead);
    return response.data;
  }

  static async delete(notificationId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(
      EndPoints.notification.delete.replace(
        ":notification_id",
        String(notificationId)
      )
    );
    return response.data;
  }

  static async deleteAll(): Promise<ApiResponse<void>> {
    const response = await api.delete(EndPoints.notification.deleteAll);
    return response.data;
  }
}

export default NotificationApi;