import { useCallback, useEffect, useMemo, useState } from "react";
import type { 
  Notification, 
  UpdateNotificationRequest 
} from "../models/Notification";
import StatusCodes from "../constants/StatusCodes";
import { notificationApi } from "../services/NotificationApi";

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await notificationApi.getAll();
      setItems(res.data ?? []);
    } catch (err: any) {
      if (err.response?.status === StatusCodes.NOT_FOUND) {
        setItems([]);
        return;
      }
      const message =
        err?.response?.data?.message ?? "Failed to fetch notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: number, data: UpdateNotificationRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        const res = await notificationApi.update(id, data);
        setItems((prev) =>
          prev.map((item) =>
            item.notification_id === id ? { ...item, ...res.data } : item
          )
        );
        setSuccess("Notification updated successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to update notification";
        setError(message);
        return false;
      }
    },
    []
  );

  const updateAll = useCallback(
    async (data: UpdateNotificationRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        await notificationApi.updateAll(data);
        // Refresh all items since we updated all
        await fetchAll();
        setSuccess("All notifications updated successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to update all notifications";
        setError(message);
        return false;
      }
    },
    [fetchAll]
  );

  const markAsRead = useCallback(
    async (id: number): Promise<boolean> => {
      return update(id, { notification_id: id, is_read: true });
    },
    [update]
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      setError("");
      setSuccess("");
      await notificationApi.updateAll({ notification_id: 0, is_read: true });
      // Refresh all items since we updated all
      await fetchAll();
      setSuccess("All notifications marked as read");
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to mark all notifications as read";
      setError(message);
      return false;
    }
  }, [fetchAll]);

  const remove = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError("");
      setSuccess("");
      await notificationApi.delete(id);
      setItems((prev) =>
        prev.filter((item) => item.notification_id !== id)
      );
      setSuccess("Notification deleted successfully");
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to delete notification";
      setError(message);
      return false;
    }
  }, []);

  const removeAll = useCallback(async (): Promise<boolean> => {
    try {
      setError("");
      setSuccess("");
      await notificationApi.deleteAll();
      setItems([]);
      setSuccess("All notifications deleted successfully");
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to delete all notifications";
      setError(message);
      return false;
    }
  }, []);

  const getById = useCallback(
    (id: number): Notification | undefined => {
      return items.find((item) => item.notification_id === id);
    },
    [items]
  );

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items]
  );

  const readCount = useMemo(
    () => items.filter((item) => item.is_read).length,
    [items]
  );

  const memoizedValues = useMemo(
    () => ({
      items,
      loading,
      error,
      success,
      fetchAll,
      update,
      updateAll,
      markAsRead,
      markAllAsRead,
      remove,
      removeAll,
      getById,
      clearMessages,
      hasItems: items.length > 0,
      count: items.length,
      unreadCount,
      readCount,
    }),
    [
      items,
      loading,
      error,
      success,
      fetchAll,
      update,
      updateAll,
      markAsRead,
      markAllAsRead,
      remove,
      removeAll,
      getById,
      clearMessages,
      unreadCount,
      readCount,
    ]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  return memoizedValues;
}