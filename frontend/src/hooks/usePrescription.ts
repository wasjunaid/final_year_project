import { useCallback, useEffect, useState } from "react";
import PrescriptionApi from "../services/prescriptionApi";
import type {
  Prescription,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
} from "../models/Prescription";

export function usePrescription(appointmentId?: number) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchByAppointment = useCallback(
    async (id?: number) => {
      const targetId = id ?? appointmentId;
      if (!targetId) {
        setPrescription(null);
        return null;
      }

      try {
        setLoading(true);
        setError("");
        const res = await PrescriptionApi.getByAppointmentId(targetId);
        const data = res.data ?? null;
        setPrescription(data);
        return data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to fetch prescription";
        setError(message);
        setPrescription(null);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [appointmentId]
  );

  useEffect(() => {
    if (appointmentId) {
      void fetchByAppointment(appointmentId);
    }
  }, [appointmentId, fetchByAppointment]);

  const create = useCallback(async (payload: CreatePrescriptionRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await PrescriptionApi.create(payload);
      setPrescription(res.data ?? null);
      setSuccess("Prescription created");
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
      setPrescription(res.data ?? null);
      setSuccess("Prescription updated");
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
      setPrescription((prev) =>
        prev && prev.prescription_id === id ? null : prev
      );
      setSuccess("Prescription removed");
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

  return {
    prescription,
    loading,
    error,
    success,
    fetchByAppointment,
    create,
    update,
    remove,
    clearMessages,
  };
}

export type UsePrescriptionReturn = ReturnType<typeof usePrescription>;

export default usePrescription;
