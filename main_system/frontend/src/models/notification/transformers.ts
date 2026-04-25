import type { NotificationDto } from './dto';
import type { NotificationModel } from './model';

// Helper to calculate time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
};

export const transformNotificationDto = (dto: NotificationDto): NotificationModel => {
  const createdAt = new Date(dto.created_at);
  const updatedAt = new Date(dto.updated_at);
  
  return {
    id: dto.notification_id,
    personId: dto.person_id,
    role: dto.role,
    title: dto.title,
    message: dto.message,
    type: dto.type,
    isRead: dto.is_read,
    relatedId: dto.related_id,
    relatedTable: dto.related_table,
    createdAt,
    updatedAt,
    timeAgo: getTimeAgo(createdAt),
  };
};

export const transformNotificationDtoArray = (dtos: NotificationDto[]): NotificationModel[] => {
  return dtos.map(transformNotificationDto);
};
