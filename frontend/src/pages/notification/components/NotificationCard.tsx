interface Notification {
  notification_id: number;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface Props {
  notification: Notification;
}

function NotificationCard({ notification }: Props) {
  return (
    <div
      key={notification.notification_id}
      className={`p-4 rounded shadow bg-white border ${
        notification.read ? "opacity-70" : "border-primary"
      }`}
    >
      <div className="font-semibold">{notification.title}</div>
      <div className="text-gray-700">{notification.message}</div>
      <div className="text-xs text-gray-400 mt-1">
        {new Date(notification.created_at).toLocaleString()}
      </div>
    </div>
  );
}

export default NotificationCard;
