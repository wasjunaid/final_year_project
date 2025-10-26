import { useCallback, useEffect, useMemo, useState } from "react";
import { insuranceCompanyApi } from "../services/insuranceCompanyApi";
import type {
  InsuranceCompany,
  CreateInsuranceCompanyRequest,
  UpdateInsuranceCompanyRequest,
} from "../models/InsuranceCompany";
import StatusCodes from "../constants/StatusCodes";

export function useInsuranceCompanies() {
  const [items, setItems] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await insuranceCompanyApi.get();
      setItems(res.data ?? []);
    } catch (err: any) {
      if (err.response?.status === StatusCodes.NOT_FOUND) {
        setItems([]);
        return;
      }
      const message =
        err?.response?.data?.message ?? "Failed to fetch insurance companies";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (data: CreateInsuranceCompanyRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        const res = await insuranceCompanyApi.insert(data);
        setItems((prev) => [...prev, res.data]);
        setSuccess("Insurance company created successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to create insurance company";
        setError(message);
        return false;
      }
    },
    []
  );

  const update = useCallback(
    async (id: number, data: UpdateInsuranceCompanyRequest): Promise<boolean> => {
      try {
        setError("");
        setSuccess("");
        const res = await insuranceCompanyApi.update(id, data);
        setItems((prev) =>
          prev.map((item) =>
            item.insurance_company_id === id ? { ...item, ...res.data } : item
          )
        );
        setSuccess("Insurance company updated successfully");
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to update insurance company";
        setError(message);
        return false;
      }
    },
    []
  );

  const remove = useCallback(async (_id: number): Promise<boolean> => {
    // Note: Delete functionality not available for insurance companies
    setError("Delete functionality is not available for insurance companies");
    return false;
  }, []);

  const getById = useCallback(
    (id: number): InsuranceCompany | undefined => {
      return items.find((item) => item.insurance_company_id === id);
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
