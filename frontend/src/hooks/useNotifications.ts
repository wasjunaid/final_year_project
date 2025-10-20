import { useCallback, useEffect, useState } from "react";
import NotificationApi from "../services/notificationApi";
import type { Notification } from "../models/Notification";

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await NotificationApi.getAll();
      setItems(res.data ?? []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setItems([]);
      } else {
        const message =
          err?.response?.data?.message ?? "Failed to fetch notifications";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      setError("");
      await NotificationApi.markAsRead(notificationId);
      setItems((prev) =>
        prev.map((item) =>
          item.notification_id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );
      setSuccess("Notification marked as read");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to mark notification as read";
      setError(message);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await NotificationApi.markAllAsRead();
      setItems((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
      setSuccess("All notifications marked as read");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to mark all notifications as read";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (notificationId: number) => {
    try {
      setError("");
      await NotificationApi.delete(notificationId);
      setItems((prev) =>
        prev.filter((item) => item.notification_id !== notificationId)
      );
      setSuccess("Notification deleted");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to delete notification";
      setError(message);
      throw err;
    }
  }, []);

  const removeAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await NotificationApi.deleteAll();
      setItems([]);
      setSuccess("All notifications deleted");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to delete all notifications";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const getUnreadCount = useCallback(() => {
    return items.filter((item) => !item.is_read).length;
  }, [items]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return {
    items,
    loading,
    error,
    success,
    fetchAll,
    markAsRead,
    markAllAsRead,
    remove,
    removeAll,
    clearMessages,
    getUnreadCount,
  };
}

export default useNotifications;