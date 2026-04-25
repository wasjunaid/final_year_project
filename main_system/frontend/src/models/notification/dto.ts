export interface NotificationDto {
  notification_id: number;
  person_id: number;
  role: string;
  title: string;
  message: string;
  type: 'Reminder' | 'Alert' | 'Info' | 'Success' | 'Warning';
  is_read: boolean;
  related_id: number | null;
  related_table: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}
