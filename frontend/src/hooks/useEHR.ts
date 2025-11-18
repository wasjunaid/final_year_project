import { useState, useCallback } from 'react';
import { ehrApi } from '../services/ehrApi';
import type { EHR } from '../models/EHR';

export function useEHR() {
  const [ehr, setEhr] = useState<EHR | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Clear messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get patient's EHR (for doctor with access)
  const getPatientEHR = useCallback(async (patient_id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await ehrApi.getPatientEHR(patient_id);
      setEhr(response.data || null);
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch patient EHR';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get my EHR (for patient)
  const getMyEHR = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await ehrApi.getMyEHR();
      setEhr(response.data || null);
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch EHR';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update EHR
  const updateEHR = useCallback(async (data: Partial<EHR>): Promise<boolean> => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await ehrApi.update(data);
      setEhr(response.data || null);
      setSuccess('EHR updated successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update EHR';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ehr,
    loading,
    error,
    success,
    getPatientEHR,
    getMyEHR,
    updateEHR,
    clearMessages,
  };
}

export default useEHR;