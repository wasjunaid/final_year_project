import { useState, useCallback, useEffect } from 'react';
import { hospitalRepository } from '../../repositories/hospital';
import { useProfileStore } from '../../stores/profile';
import { AppError } from '../../utils/appError';
import type { ErrorInfo, SuccessInfo } from '../../models/api';
import type { HospitalModel } from '../../models/hospital';
import type { HospitalStaffProfileModel } from '../../models/profile';

export const useHospitalProfileController = () => {
  // State
  const [hospital, setHospital] = useState<HospitalModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);

  // Profile store
  const profile = useProfileStore((state) => state.profile);

  // Get hospital ID from profile
  const hospitalId = profile && 'hospitalId' in profile 
    ? (profile as HospitalStaffProfileModel).hospitalId 
    : undefined;

  // Fetch hospital data
  const fetchHospital = useCallback(async (): Promise<boolean> => {
    if (!hospitalId) {
      setError({
        message: 'Hospital ID not found in profile',
        title: 'Error',
      });
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Fetch all hospitals and find the one matching the ID
      const hospitals = await hospitalRepository.getAllHospitals();
      const currentHospital = hospitals.find(h => h.hospital_id === hospitalId);

      if (!currentHospital) {
        throw new AppError({
          message: 'Hospital not found',
          title: 'Error',
        });
      }

      setHospital(currentHospital);
      return true;
    } catch (err: any) {
      console.error('[Hospital Profile Controller] Failed to fetch hospital:', err);
      
      if (err instanceof AppError) {
        setError({
          message: err.message,
          title: err.title,
          subtitle: err.subtitle,
        });
        return false;
      }

      setError({ 
        message: err?.message || 'Failed to load hospital information', 
        title: 'Error' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  // Update hospital
  const updateHospital = useCallback(async (
    id: number, 
    name: string, 
    walletAddress: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await hospitalRepository.updateHospital(id, {
        name,
        wallet_address: walletAddress,
      });
      
      // Re-fetch hospital after update
      await fetchHospital();

      setSuccess({
        message: 'Hospital information updated successfully',
        title: 'Success',
      });

      return true;
    } catch (err: any) {
      console.error('[Hospital Profile Controller] Failed to update hospital:', err);

      if (err instanceof AppError) {
        setError({
          message: err.message,
          title: err.title,
          subtitle: err.subtitle,
        });
        return false;
      }

      setError({ 
        message: err?.message || 'Failed to update hospital information', 
        title: 'Error' 
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchHospital]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Auto-fetch on mount when hospitalId is available
  useEffect(() => {
    if (hospitalId) {
      fetchHospital();
    }
  }, [hospitalId, fetchHospital]);

  return {
    // State
    hospital,
    loading,
    error,
    success,
    
    // Actions
    updateHospital,
    fetchHospital,
    clearMessages,
  };
};
