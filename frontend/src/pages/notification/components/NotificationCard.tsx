import { FaCheck, FaTrash, FaClock, FaBell } from "react-icons/fa";
import Button from "../../../components/Button";
import type { Notification } from "../../../models/Notification";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  disabled?: boolean;
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  disabled = false,
}: NotificationCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "appointment":
        return <FaClock className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "appointment":
        return "text-blue-600";
      case "reminder":
        return "text-yellow-600";
      case "alert":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-sm border transition-all ${
        notification.is_read
          ? "bg-gray-50 border-gray-200 opacity-80"
          : "bg-white border-blue-200 shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">
          {getTypeIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {notification.title}
              </h3>
              <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>

            <div className="flex gap-1 ml-2">
              {!notification.is_read && onMarkAsRead && (
                <Button
                  label=""
                  icon={<FaCheck />}
                  size="xs"
                  variant="secondary"
                  onClick={() => onMarkAsRead(notification.notification_id)}
                  disabled={disabled}
                  title="Mark as read"
                />
              )}
              {onDelete && (
                <Button
                  label=""
                  icon={<FaTrash />}
                  size="xs"
                  variant="danger"
                  onClick={() => onDelete(notification.notification_id)}
                  disabled={disabled}
                  title="Delete notification"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium capitalize ${getTypeColor(
                  notification.type
                )}`}
              >
                {notification.type}
              </span>
              {!notification.is_read && (
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(notification.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
