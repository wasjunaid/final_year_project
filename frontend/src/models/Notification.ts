export interface Notification {
  notification_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id?: number;
  related_type?: string;
  created_at: string;
}

export interface UpdateNotificationRequest {
  notification_id: number;
}