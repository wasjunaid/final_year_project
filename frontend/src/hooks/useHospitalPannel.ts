import { useState, useEffect } from "react";
import hospitalPannelApi from "../services/hospitalPannelApi";
import type {
  HospitalPannel,
  InsertHospitalPannelRequest,
} from "../models/HospitalPannel";
import StatusCodes from "../constants/StatusCodes";

export function useHospitalPannel() {
  const [panels, setPanels] = useState<HospitalPannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchPanels = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await hospitalPannelApi.getAll();
      setPanels(res.data || []);
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setPanels([]);
        return;
      }
      setError(err?.response?.data?.message || "Failed to fetch panel list");
    } finally {
      setLoading(false);
    }
  };

  const insertPanel = async (body: InsertHospitalPannelRequest) => {
    try {
      setLoading(true);
      setError("");
      const res = await hospitalPannelApi.insert(body);
      setPanels((prev) => [res.data, ...prev]);
      setSuccess("Panel item added");
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add panel");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removePanel = async (hospital_panel_list_id: number) => {
    try {
      setLoading(true);
      setError("");
      await hospitalPannelApi.remove(hospital_panel_list_id);
      setPanels((prev) =>
        prev.filter((p) => p.hospital_pannel_list_id !== hospital_panel_list_id)
      );
      setSuccess("Panel item removed");
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove panel");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanels();
  }, []);

  return {
    panels,
    loading,
    error,
    success,
    fetchPanels,
    insertPanel,
    removePanel,
    clearMessages: () => {
      setError("");
      setSuccess("");
    },
  };
}

export default useHospitalPannel;
