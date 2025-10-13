import { useCallback, useEffect, useState } from "react";
import PrescriptionApi from "../services/prescriptionApi";
import { useUserRole } from "./useUserRole";
import { ROLES } from "../constants/roles";
import type {
  Prescription,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
} from "../models/Prescription";

export function usePrescriptions() {
  const [items, setItems] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const role = useUserRole();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let res;
      if (role === ROLES.PATIENT) {
        res = await PrescriptionApi.getAllForPatient();
      } else if (role === ROLES.DOCTOR) {
        res = await PrescriptionApi.getAllForDoctor();
      } else {
        setItems([]);
        return [];
      }

      const data = res.data ?? [];
      setItems(data);
      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to fetch prescriptions";
      setError(message);
      setItems([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [role]);

  const create = useCallback(async (payload: CreatePrescriptionRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await PrescriptionApi.create(payload);
      if (res.data) {
        setItems((prev) => [res.data, ...prev]);
      }
      setSuccess("Prescription created successfully");
      return res.data ?? null;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to create prescription";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (payload: UpdatePrescriptionRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await PrescriptionApi.update(payload);
      if (res.data) {
        setItems((prev) =>
          prev.map((item) =>
            item.prescription_id === payload.prescription_id ? res.data! : item
          )
        );
      }
      setSuccess("Prescription updated successfully");
      return res.data ?? null;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to update prescription";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError("");
      await PrescriptionApi.remove(id);
      setItems((prev) => prev.filter((item) => item.prescription_id !== id));
      setSuccess("Prescription removed successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to remove prescription";
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
    remove,
    clearMessages,
  };
}

export default usePrescriptions;
