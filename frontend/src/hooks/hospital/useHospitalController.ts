import { useState, useCallback, useEffect } from 'react';
import { hospitalRepository } from '../../repositories/hospital';
import type { HospitalModel } from '../../models/hospital';
import { AppError } from '../../utils/appError';

export const useHospitalController = () => {
  const [hospitals, setHospitals] = useState<HospitalModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Fetch all hospitals
  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const hospitalsList = await hospitalRepository.getAllHospitals();
      setHospitals(hospitalsList);
    } catch (err) {
      const errorMessage = err instanceof AppError ? err.message : 'Failed to fetch hospitals';
      setError(errorMessage);
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new hospital
  const createHospital = useCallback(
    async (name: string): Promise<HospitalModel | null> => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');

        const newHospital = await hospitalRepository.createHospital(name);
        setHospitals((prev) => [...prev, newHospital]);
        setSuccess('Hospital created successfully');
        return newHospital;
      } catch (err) {
        const errorMessage = err instanceof AppError ? err.message : 'Failed to create hospital';
        setError(errorMessage);
        console.error('Error creating hospital:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update hospital
  const updateHospital = useCallback(
    async (hospitalId: number, name: string): Promise<HospitalModel | null> => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');

        const updatedHospital = await hospitalRepository.updateHospital(hospitalId, name);
        setHospitals((prev) =>
          prev.map((h) => (h.hospital_id === hospitalId ? updatedHospital : h))
        );
        setSuccess('Hospital updated successfully');
        return updatedHospital;
      } catch (err) {
        const errorMessage = err instanceof AppError ? err.message : 'Failed to update hospital';
        setError(errorMessage);
        console.error('Error updating hospital:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Auto-fetch hospitals on mount
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return {
    hospitals,
    loading,
    error,
    success,
    fetchHospitals,
    createHospital,
    updateHospital,
    clearMessages,
  };
};
