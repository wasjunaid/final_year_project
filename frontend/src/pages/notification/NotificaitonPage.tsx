import { useState, useMemo } from "react";
import {
  FaBell,
  FaCheckDouble,
  FaTrashAlt,
  FaFilter,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Button from "../../components/Button";
import NotificationCard from "./components/NotificationCard";
import { useNotifications } from "../../hooks/useNotifications";

type FilterType = "all" | "unread" | "read";

function NotificationPage() {
  const {
    items: notifications,
    loading,
    error,
    success,
    markAsRead,
    markAllAsRead,
    remove,
    removeAll,
    clearMessages,
    getUnreadCount,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>("all");
  const [actionLoading, setActionLoading] = useState(false);

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.is_read);
      case "read":
        return notifications.filter((n) => n.is_read);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const unreadCount = getUnreadCount();

  const handleMarkAsRead = async (id: number) => {
    try {
      setActionLoading(true);
      await markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoading(true);
      await remove(id);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      try {
        setActionLoading(true);
        await removeAll();
      } catch (error) {
        console.error("Failed to delete all:", error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const getFilterButtonVariant = (filterType: FilterType) =>
    filter === filterType ? "primary" : "secondary";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "All notifications read"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              label="Mark All Read"
              icon={<FaCheckDouble />}
              size="sm"
              variant="secondary"
              onClick={handleMarkAllAsRead}
              disabled={loading || actionLoading}
            />
          )}
          {notifications.length > 0 && (
            <Button
              label="Delete All"
              icon={<FaTrashAlt />}
              size="sm"
              variant="danger"
              onClick={handleDeleteAll}
              disabled={loading || actionLoading}
            />
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearMessages}
            className="text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-600 rounded-lg p-3 flex justify-between items-center">
          <span>{success}</span>
          <button
            onClick={clearMessages}
            className="text-green-400 hover:text-green-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <FaFilter className="text-gray-400" />
        <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
        <div className="flex gap-1">
          <Button
            label={`All (${notifications.length})`}
            size="sm"
            variant={getFilterButtonVariant("all")}
            onClick={() => setFilter("all")}
          />
          <Button
            label={`Unread (${unreadCount})`}
            icon={<FaEye />}
            size="sm"
            variant={getFilterButtonVariant("unread")}
            onClick={() => setFilter("unread")}
          />
          <Button
            label={`Read (${notifications.length - unreadCount})`}
            icon={<FaEyeSlash />}
            size="sm"
            variant={getFilterButtonVariant("read")}
            onClick={() => setFilter("read")}
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading notifications...</div>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="text-center py-8">
            <FaBell className="mx-auto text-4xl text-gray-300 mb-4" />
            <div className="text-gray-500">
              {filter === "all"
                ? "No notifications found."
                : filter === "unread"
                ? "No unread notifications."
                : "No read notifications."}
            </div>
          </div>
        )}

        {filteredNotifications.map((notification) => (
          <NotificationCard
            key={notification.notification_id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            disabled={actionLoading}
          />
        ))}
      </div>
    </div>
  );
}

export default NotificationPage;
