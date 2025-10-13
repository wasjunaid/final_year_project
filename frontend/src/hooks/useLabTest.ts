import { useCallback, useEffect, useState } from "react";
import LabTestApi from "../services/labTestApi";
import type {
  LabTest,
  CreateLabTestRequest,
  UpdateLabTestRequest,
} from "../models/LabTest";

export function useLabTest() {
  const [items, setItems] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await LabTestApi.getAll();
      setItems(res.data ?? []);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to fetch lab tests";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateLabTestRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await LabTestApi.create(payload);
      if (res.data) {
        setItems((prev) => [res.data, ...prev]);
      }
      setSuccess("Lab test created");
      return res.data ?? null;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to create lab test";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (payload: UpdateLabTestRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await LabTestApi.update(payload);
      if (res.data) {
        setItems((prev) =>
          prev.map((item) =>
            item.lab_test_id === payload.lab_test_id ? res.data : item
          )
        );
      }
      setSuccess("Lab test updated");
      return res.data ?? null;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to update lab test";
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

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return {
    items,
    loading,
    error,
    success,
    fetchAll,
    create,
    update,
    clearMessages,
  };
}

export default useLabTest;
