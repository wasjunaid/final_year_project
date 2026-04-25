import { useCallback, useState } from "react";
import type { ISurgicalHistoryRepository } from "../../repositories/patient/surgicalHistoryRepository";
import type { SurgicalHistory } from "../../models/patient/surgicalHistory/model";
import type { CreateSurgicalHistoryPayload } from "../../models/patient/surgicalHistory/payload";

export interface ISurgicalHistoryController {
  // State
  surgicalHistory: SurgicalHistory[];
  loading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchSurgicalHistoryForDoctor: (patientId: number) => Promise<SurgicalHistory[]>;
  createSurgicalHistoryForDoctor: (patientId: number, payload: CreateSurgicalHistoryPayload) => Promise<SurgicalHistory>;
  fetchSurgicalHistoryForPatient: () => Promise<SurgicalHistory[]>;
  createSurgicalHistoryForPatient: (payload: CreateSurgicalHistoryPayload) => Promise<SurgicalHistory>;
  clearMessages: () => void;
}

const createSurgicalHistoryController = (surgicalHistoryRepository: ISurgicalHistoryRepository): ISurgicalHistoryController => {
  const [surgicalHistory, setSurgicalHistory] = useState<SurgicalHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSurgicalHistoryForDoctor = useCallback(async (patientId: number): Promise<SurgicalHistory[]> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await surgicalHistoryRepository.getSurgicalHistoryForDoctor(patientId);
      setSurgicalHistory(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch surgical history';
      setError(errorMessage);
      console.error('Error fetching surgical history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surgicalHistoryRepository]);

  const fetchSurgicalHistoryForPatient = useCallback(async (): Promise<SurgicalHistory[]> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await surgicalHistoryRepository.getSurgicalHistoryForPatient();
      setSurgicalHistory(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch surgical history';
      setError(errorMessage);
      console.error('Error fetching surgical history for patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surgicalHistoryRepository]);

  const createSurgicalHistoryForDoctor = useCallback(async (patientId: number, payload: CreateSurgicalHistoryPayload): Promise<SurgicalHistory> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newItem = await surgicalHistoryRepository.createSurgicalHistoryForDoctor(patientId, payload);
      setSurgicalHistory(prev => [...prev, newItem]);
      setSuccess('Surgical history added successfully');
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add surgical history';
      setError(errorMessage);
      console.error('Error adding surgical history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surgicalHistoryRepository]);

  const createSurgicalHistoryForPatient = useCallback(async (payload: CreateSurgicalHistoryPayload): Promise<SurgicalHistory> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newItem = await surgicalHistoryRepository.createSurgicalHistoryForPatient(payload);
      setSurgicalHistory(prev => [...prev, newItem]);
      setSuccess('Surgical history added successfully');
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add surgical history';
      setError(errorMessage);
      console.error('Error adding surgical history for patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surgicalHistoryRepository]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    surgicalHistory,
    loading,
    error,
    success,
    clearMessages,
    fetchSurgicalHistoryForDoctor,
    fetchSurgicalHistoryForPatient,
    createSurgicalHistoryForDoctor,
    createSurgicalHistoryForPatient,
  };
};

export default createSurgicalHistoryController;
