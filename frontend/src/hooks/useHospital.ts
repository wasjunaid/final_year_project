import { useState, useCallback, useMemo } from 'react';
import { hospitalApi } from '../services/hospitalApi';
import type { 
  Hospital, 
  CreateHospitalRequest, 
  UpdateHospitalRequest
} from '../models/Hospital';
import StatusCodes from '../constants/StatusCodes';

export function useHospital() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get all hospitals
  const getHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalApi.get();
      setHospitals(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setHospitals([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch hospitals';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new hospital
  const createHospital = useCallback(async (data: CreateHospitalRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalApi.insert(data);
      setHospitals(prev => [response.data, ...prev]);
      setSuccess('Hospital created successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to create hospital';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update hospital
  const updateHospital = useCallback(async (hospitalId: number, data: UpdateHospitalRequest) => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalApi.update(hospitalId, data);
      setHospitals(prev => prev.map(hospital => 
        hospital.hospital_id === hospitalId 
          ? response.data
          : hospital
      ));
      setSuccess('Hospital updated successfully');
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update hospital';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    hospitals,
    loading,
    error,
    success,
    clearMessages,
    getHospitals,
    createHospital,
    updateHospital,
  }), [
    hospitals,
    loading,
    error,
    success,
    clearMessages,
    getHospitals,
    createHospital,
    updateHospital,
  ]);

  return returnValue;
}

export default useHospital;