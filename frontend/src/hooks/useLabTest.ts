import { useCallback, useEffect, useMemo, useState } from "react";
import { labTestApi } from "../services/labTestApi";
import type {
  LabTest,
  CreateLabTestRequest,
  UpdateLabTestRequest,
} from "../models/LabTest";
import StatusCodes from "../constants/StatusCodes";

export function useLabTest() {
  const [items, setItems] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await labTestApi.get();
      setItems(res.data ?? []);
    } catch (err: any) {
      if (err.response?.status === StatusCodes.NOT_FOUND) {
        setItems([]);
        return;
      }
      const message =
        err?.response?.data?.message ?? "Failed to fetch lab tests";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (data: CreateLabTestRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        const res = await labTestApi.insert(data);
        setItems((prev) => [...prev, res.data]);
        setSuccess("Lab test created successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to create lab test";
        setError(message);
        return false;
      }
    },
    []
  );

  const update = useCallback(
    async (id: number, data: UpdateLabTestRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        const res = await labTestApi.update(id, data);
        setItems((prev) =>
          prev.map((item) =>
            item.lab_test_id === id ? { ...item, ...res.data } : item
          )
        );
        setSuccess("Lab test updated successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to update lab test";
        setError(message);
        return false;
      }
    },
    []
  );

  const remove = useCallback(async (_id: number): Promise<boolean> => {
    // Note: Delete functionality not available for lab tests
    setError("Delete functionality is not available for lab tests");
    return false;
  }, []);

  const getById = useCallback(
    (id: number): LabTest | undefined => {
      return items.find((item) => item.lab_test_id === id);
    },
    [items]
  );

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const memoizedValues = useMemo(
    () => ({
      items,
      loading,
      error,
      success,
      fetchAll,
      create,
      update,
      remove,
      getById,
      clearMessages,
      hasItems: items.length > 0,
      count: items.length,
    }),
    [items, loading, error, success, fetchAll, create, update, remove, getById, clearMessages]
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