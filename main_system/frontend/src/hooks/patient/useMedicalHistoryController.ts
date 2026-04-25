import { useCallback, useState } from "react";
import type { IMedicalHistoryRepository } from "../../repositories/patient/medicalHistoryRepository";
import type { MedicalHistory } from "../../models/patient/medicalHistory/model";
import type { CreateMedicalHistoryPayload } from "../../models/patient/medicalHistory/payload";

export interface IMedicalHistoryController {
  // State
  medicalHistory: MedicalHistory[];
  loading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchMedicalHistoryForDoctor: (patientId: number) => Promise<MedicalHistory[]>;
  fetchMedicalHistoryForPatient: () => Promise<MedicalHistory[]>;
  createMedicalHistoryForDoctor: (patientId: number, payload: CreateMedicalHistoryPayload) => Promise<MedicalHistory>;
  // For patients inserting their own medical history
  createMedicalHistoryForPatient: (payload: CreateMedicalHistoryPayload) => Promise<MedicalHistory>;
  clearMessages: () => void;
}

const createMedicalHistoryController = (medicalHistoryRepository: IMedicalHistoryRepository): IMedicalHistoryController => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchMedicalHistoryForDoctor = useCallback(async (patientId: number): Promise<MedicalHistory[]> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await medicalHistoryRepository.getMedicalHistoryForDoctor(patientId);
      setMedicalHistory(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch medical history';
      setError(errorMessage);
      console.error('Error fetching medical history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [medicalHistoryRepository]);

  const fetchMedicalHistoryForPatient = useCallback(async (): Promise<MedicalHistory[]> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await medicalHistoryRepository.getMedicalHistoryForPatient();
      setMedicalHistory(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch medical history';
      setError(errorMessage);
      console.error('Error fetching medical history for patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [medicalHistoryRepository]);

  const createMedicalHistoryForDoctor = useCallback(async (patientId: number, payload: CreateMedicalHistoryPayload): Promise<MedicalHistory> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newItem = await medicalHistoryRepository.createMedicalHistoryForDoctor(patientId, payload);
      setMedicalHistory(prev => [...prev, newItem]);
      setSuccess('Medical history added successfully');
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add medical history';
      setError(errorMessage);
      console.error('Error adding medical history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [medicalHistoryRepository]);

  const createMedicalHistoryForPatient = useCallback(async (payload: CreateMedicalHistoryPayload): Promise<MedicalHistory> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newItem = await medicalHistoryRepository.createMedicalHistoryForPatient(payload);
      setMedicalHistory(prev => [...prev, newItem]);
      setSuccess('Medical history added successfully');
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add medical history';
      setError(errorMessage);
      console.error('Error adding medical history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [medicalHistoryRepository]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    medicalHistory,
    loading,
    error,
    success,
    clearMessages,
    fetchMedicalHistoryForDoctor,
    fetchMedicalHistoryForPatient,
    createMedicalHistoryForDoctor,
    createMedicalHistoryForPatient,
  };
};

export default createMedicalHistoryController;
