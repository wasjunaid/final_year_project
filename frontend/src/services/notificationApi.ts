import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Notification, 
  UpdateNotificationRequest
} from '../models/Notification';

export const notificationApi = {
  // GET /notification
  getAll: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get(EndPoints.notification.getAll);
    return response.data;
  },

  // PUT /notification/:notification_id
  update: async (notification_id: number, data: UpdateNotificationRequest): Promise<ApiResponse<Notification>> => {
    const url = EndPoints.notification.update.replace(':notification_id', notification_id.toString());
    const response = await api.put(url, data);
    return response.data;
  },

  // PUT /notification
  updateAll: async (data: UpdateNotificationRequest): Promise<ApiResponse<null>> => {
    const response = await api.put(EndPoints.notification.updateAll, data);
    return response.data;
  },

  // DELETE /notification/:notification_id
  delete: async (notification_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.notification.delete.replace(':notification_id', notification_id.toString());
    const response = await api.delete(url);
    return response.data;
  },

  // DELETE /notification
  deleteAll: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete(EndPoints.notification.deleteAll);
    return response.data;
  },
};