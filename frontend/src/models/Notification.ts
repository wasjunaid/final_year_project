export interface Notification {
  notification_id: number;
  person_id: number;
  role: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  is_read: boolean;
  related_id?: number;
  related_table?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationRequest {
  notification_id: number;
  is_read?: boolean;
}