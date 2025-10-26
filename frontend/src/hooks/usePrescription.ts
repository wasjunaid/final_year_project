import { useCallback, useEffect, useMemo, useState } from "react";
import { prescriptionApi } from "../services/prescriptionApi";
import type {
  Prescription,
  CreatePrescriptionRequest,
} from "../models/Prescription";
import StatusCodes from "../constants/StatusCodes";

export function usePrescriptions() {
  const [items, setItems] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchByAppointment = useCallback(async (appointmentId?: number) => {
    try {
      setLoading(true);
      setError("");
      const res = await prescriptionApi.getAgainstAppointment(appointmentId);
      setItems(res.data ?? []);
    } catch (err: any) {
      if (err.response?.status === StatusCodes.NOT_FOUND) {
        setItems([]);
        return;
      }
      const message =
        err?.response?.data?.message ?? "Failed to fetch prescriptions";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (data: CreatePrescriptionRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        const res = await prescriptionApi.insert(data);
        setItems((prev) => [...prev, res.data]);
        setSuccess("Prescription created successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to create prescription";
        setError(message);
        return false;
      }
    },
    []
  );

  const getById = useCallback(
    (id: number): Prescription | undefined => {
      return items.find((item) => item.prescription_id === id);
    },
    [items]
  );

  const getByAppointmentId = useCallback(
    (appointmentId: number): Prescription[] => {
      return items.filter((item) => item.appointment_id === appointmentId);
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
      fetchByAppointment,
      create,
      getById,
      getByAppointmentId,
      clearMessages,
      hasItems: items.length > 0,
      count: items.length,
    }),
    [
      items,
      loading,
      error,
      success,
      fetchByAppointment,
      create,
      getById,
      getByAppointmentId,
      clearMessages,
    ]
  );

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  return memoizedValues;
}