import { useState, useEffect, useCallback, useMemo } from "react";
import { hospitalPannelListApi } from "../services/hospitalPannelListApi";
import type {
  HospitalPanelList,
  CreateHospitalPanelListRequest,
} from "../models/HospitalPanelList";
import StatusCodes from "../constants/StatusCodes";

export function useHospitalPannel() {
  const [panels, setPanels] = useState<HospitalPanelList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const fetchPanels = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await hospitalPannelListApi.getAll();
      setPanels(res.data || []);
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setPanels([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || "Failed to fetch panel list";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const insertPanel = useCallback(async (body: CreateHospitalPanelListRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await hospitalPannelListApi.insert(body);
      setPanels((prev) => [res.data, ...prev]);
      setSuccess("Panel item added");
      return res.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to add panel";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const removePanel = useCallback(async (hospital_panel_list_id: number) => {
    try {
      setLoading(true);
      setError("");
      await hospitalPannelListApi.delete(hospital_panel_list_id);
      setPanels((prev) =>
        prev.filter((p) => p.hospital_panel_list_id !== hospital_panel_list_id)
      );
      setSuccess("Panel item removed");
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to remove panel";
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPanels();
  }, [fetchPanels]);

  // Memoized return value
  const returnValue = useMemo(() => ({
    panels,
    loading,
    error,
    success,
    fetchPanels,
    insertPanel,
    removePanel,
    clearMessages,
  }), [
    panels,
    loading,
    error,
    success,
    fetchPanels,
    insertPanel,
    removePanel,
    clearMessages,
  ]);

  return returnValue;
}

export default useHospitalPannel;
