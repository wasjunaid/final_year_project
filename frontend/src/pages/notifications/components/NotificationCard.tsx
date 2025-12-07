import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import type { NotificationModel } from '../../../models/notification';

interface NotificationCardProps {
  notification: NotificationModel;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const getTypeColors = () => {
    switch (notification.type) {
      case 'Alert':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200 dark:border-red-800',
        };
      case 'Info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-800',
        };
      case 'Success':
        return {
          bg: 'bg-green-50 dark:bg-green-950/20',
          border: 'border-green-200 dark:border-green-800',
        };
      case 'Warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/20',
          border: 'border-yellow-200 dark:border-yellow-800',
        };
      case 'Reminder':
      default:
        return {
          bg: 'bg-primary/5 dark:bg-primary/10',
          border: 'border-primary/20 dark:border-primary/30',
        };
    }
  };

  const colors = getTypeColors();

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg transition-all duration-200
        ${colors.bg}
        ${!notification.isRead ? `border-2 ${colors.border} shadow-md` : 'border border-gray-200 dark:border-[#404040] shadow-sm opacity-75'}
        hover:shadow-lg dark:shadow-none dark:hover:shadow-md
        cursor-pointer
        group
      `}
      onClick={handleMarkAsRead}
    >
      <div className="flex gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0 ml-4">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[#e5e5e5] mb-1">
            {notification.title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-700 dark:text-[#a0a0a0] mb-2 line-clamp-2">
            {notification.message}
          </p>

          {/* Time ago */}
          <p className="text-xs text-gray-500 dark:text-[#808080]">
            {notification.timeAgo}
          </p>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <button
              onClick={handleMarkAsRead}
              className="p-1.5 rounded-md hover:bg-white/50 dark:hover:bg-black/20 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
              title="Mark as read"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md hover:bg-white/50 dark:hover:bg-black/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
