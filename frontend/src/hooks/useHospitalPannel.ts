import { useEffect, useState } from "react";
import type { HospitalPannel } from "../models/HospitalPannel";
import StatusCodes from "../constants/StatusCodes";
import HospitalPannelApi from "../services/hospitalPannelApi";

export const useHospitalPannel = () => {
  const [hospitalPannels, setHospitalPannels] = useState<HospitalPannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  //loading states for individual operations
  const [addPannelLoading, setAddPannelLoading] = useState(false);
  const [removePannelLoading, setRemovePannelLoading] = useState(false);

  //fetch all hospital pannels
  const fetchHospitalPannels = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const response = await HospitalPannelApi.getAll();
      setHospitalPannels(response.data);
    } catch (err: any) {
      if (err.response?.status === StatusCodes.NOT_FOUND) {
        setHospitalPannels([]);
        return;
      }
      setError(
        err.response?.data?.message || "Failed to fetch hospital pannels"
      );
    } finally {
      setLoading(false);
    }
  };

  const addHospitalPannel = async (
    insurance_company_id: string
  ): Promise<boolean> => {
    try {
      setAddPannelLoading(true);

      await HospitalPannelApi.insert({ insurance_company_id });

      //TODO: add local update or fetch again

      setSuccess("Hospital pannel added successfully");
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to add hospital pannel");
      return false;
    } finally {
      setAddPannelLoading(false);
    }
  };

  const removeHospitalPannel = async (
    insurance_company_id: number
  ): Promise<boolean> => {
    try {
      setRemovePannelLoading(true);

      await HospitalPannelApi.remove(insurance_company_id);

      //TODO: add local update or fetch again

      setSuccess("Hospital pannel removed successfully");
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? "Failed to remove hospital pannel"
      );
      return false;
    } finally {
      setRemovePannelLoading(false);
    }
  };

  //clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  //auto fetch on component mount
  useEffect(() => {
    fetchHospitalPannels();
  }, []);

  return {
    hospitalPannels,
    loading,
    error,
    success,

    //individual loading states
    addPannelLoading,
    removePannelLoading,

    //functions
    fetchHospitalPannels,
    addHospitalPannel,
    removeHospitalPannel,

    //clear messages
    clearMessages,
  };
};
