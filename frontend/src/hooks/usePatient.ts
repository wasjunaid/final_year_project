import { useState, useCallback, useMemo } from 'react';
import { patientApi } from '../services/patientApi';
import type { 
  Patient, 
  UpdatePatientRequest
} from '../models/Patient';
import StatusCodes from '../constants/StatusCodes';

export function usePatient() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get current patient profile
  const getPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientApi.get();
      setPatient(response.data);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setPatient(null);
        return null;
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch patient profile';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update patient profile
  const updatePatient = useCallback(async (data: UpdatePatientRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await patientApi.update(data);
      setPatient(response.data);
      setSuccess('Patient profile updated successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update patient profile';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    patient,
    loading,
    error,
    success,
    clearMessages,
    getPatient,
    updatePatient,
  }), [
    patient,
    loading,
    error,
    success,
    clearMessages,
    getPatient,
    updatePatient,
  ]);

  return returnValue;
}

export default usePatient;