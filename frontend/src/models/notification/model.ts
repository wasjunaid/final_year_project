export interface NotificationModel {
  id: number;
  personId: number;
  role: string;
  title: string;
  message: string;
  type: 'Reminder' | 'Alert' | 'Info' | 'Success' | 'Warning';
  isRead: boolean;
  relatedId: number | null;
  relatedTable: string | null;
  createdAt: Date;
  updatedAt: Date;
  timeAgo: string; // Computed: "2 hours ago", "3 days ago", etc.
}
