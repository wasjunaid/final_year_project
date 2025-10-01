import { useEffect, useState } from "react";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { FaBell } from "react-icons/fa";
import NotificationCard from "./components/NotificationCard";

interface Notification {
  notification_id: number;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(EndPoints.notification.list);
        setNotifications(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <FaBell /> Notifications
      </h2>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && notifications.length === 0 && (
        <div className="text-gray-500">No notifications found.</div>
      )}

      <div className="flex flex-col gap-4">
        {notifications.map((n) => (
          <NotificationCard key={n.notification_id} notification={n} />
        ))}
      </div>
    </div>
  );
}

export default NotificationPage;
