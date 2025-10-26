import { useCallback, useEffect, useMemo, useState } from "react";
import { patientInsuranceApi } from "../services/patientInsuranceApi";
import type {
  PatientInsurance,
  CreatePatientInsuranceRequest,
  UpdatePatientInsuranceRequest,
} from "../models/PatientInsurance";
import StatusCodes from "../constants/StatusCodes";

export function usePatientInsurance() {
  const [items, setItems] = useState<PatientInsurance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await patientInsuranceApi.get();
      setItems(res.data ?? []);
    } catch (err: any) {
      if (err.response?.status === StatusCodes.NOT_FOUND) {
        setItems([]);
        return;
      }
      const message =
        err?.response?.data?.message ?? "Failed to fetch patient insurances";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (data: CreatePatientInsuranceRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        const res = await patientInsuranceApi.insert(data);
        setItems((prev) => [...prev, res.data]);
        setSuccess("Patient insurance created successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to create patient insurance";
        setError(message);
        return false;
      }
    },
    []
  );

  const update = useCallback(
    async (id: number, data: UpdatePatientInsuranceRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        const res = await patientInsuranceApi.update(id, data);
        setItems((prev) =>
          prev.map((item) =>
            item.patient_insurance_id === id ? { ...item, ...res.data } : item
          )
        );
        setSuccess("Patient insurance updated successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to update patient insurance";
        setError(message);
        return false;
      }
    },
    []
  );

  const remove = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError("");
      setSuccess("");
      await patientInsuranceApi.delete(id);
      setItems((prev) =>
        prev.filter((item) => item.patient_insurance_id !== id)
      );
      setSuccess("Patient insurance deleted successfully");
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to delete patient insurance";
      setError(message);
      return false;
    }
  }, []);

  const sendVerificationRequest = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError("");
      setSuccess("");
      await patientInsuranceApi.sendVerificationRequest(id);
      setSuccess("Verification request sent successfully");
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to send verification request";
      setError(message);
      return false;
    }
  }, []);

  const getById = useCallback(
    (id: number): PatientInsurance | undefined => {
      return items.find((item) => item.patient_insurance_id === id);
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
      sendVerificationRequest,
      getById,
      clearMessages,
      hasItems: items.length > 0,
      count: items.length,
    }),
    [items, loading, error, success, fetchAll, create, update, remove, sendVerificationRequest, getById, clearMessages]
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