import { useCallback, useEffect, useState } from "react";
import MedicineApi from "../services/medicineApi";
import type {
  Medicine,
  CreateMedicineRequest,
  UpdateMedicineRequest,
} from "../models/Medicine";
import StatusCodes from "../constants/StatusCodes";

export function useMedicine() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await MedicineApi.getAll();
      setItems(res.data ?? []);
    } catch (err: any) {
      if (err.response?.status === StatusCodes.NOT_FOUND) {
        setItems([]);
        return;
      }
      const message =
        err?.response?.data?.message ?? "Failed to fetch medicines";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateMedicineRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await MedicineApi.create(payload);
      if (res.data) {
        setItems((prev) => [res.data, ...prev]);
      }
      setSuccess("Medicine created");
      return res.data ?? null;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to create medicine";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (payload: UpdateMedicineRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await MedicineApi.update(payload);
      if (res.data) {
        setItems((prev) =>
          prev.map((item) =>
            item.medicine_id === payload.medicine_id ? res.data : item
          )
        );
      }
      setSuccess("Medicine updated");
      return res.data ?? null;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to update medicine";
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

export default useMedicine;
