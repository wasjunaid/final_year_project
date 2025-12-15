import { useCallback, useState } from "react";
import type { IFamilyHistoryRepository } from "../../repositories/patient/familyHistoryRepository";
import type { FamilyHistory } from "../../models/patient/familyHistory/model";
import type { CreateFamilyHistoryPayload } from "../../models/patient/familyHistory/payload";

export interface IFamilyHistoryController {
  // State
  familyHistory: FamilyHistory[];
  loading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchFamilyHistoryForDoctor: (patientId: number) => Promise<FamilyHistory[]>;
  createFamilyHistoryForDoctor: (patientId: number, payload: CreateFamilyHistoryPayload) => Promise<FamilyHistory>;
  clearMessages: () => void;
}

const createFamilyHistoryController = (familyHistoryRepository: IFamilyHistoryRepository): IFamilyHistoryController => {
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchFamilyHistoryForDoctor = useCallback(async (patientId: number): Promise<FamilyHistory[]> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await familyHistoryRepository.getFamilyHistoryForDoctor(patientId);
      setFamilyHistory(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch family history';
      setError(errorMessage);
      console.error('Error fetching family history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [familyHistoryRepository]);

  const createFamilyHistoryForDoctor = useCallback(async (patientId: number, payload: CreateFamilyHistoryPayload): Promise<FamilyHistory> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newItem = await familyHistoryRepository.createFamilyHistoryForDoctor(patientId, payload);
      setFamilyHistory(prev => [...prev, newItem]);
      setSuccess('Family history added successfully');
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add family history';
      setError(errorMessage);
      console.error('Error adding family history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [familyHistoryRepository]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    familyHistory,
    loading,
    error,
    success,
    clearMessages,
    fetchFamilyHistoryForDoctor,
    createFamilyHistoryForDoctor,
  };
};

export default createFamilyHistoryController;
