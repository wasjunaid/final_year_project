import { useState, useCallback, useEffect } from 'react';
import type { PatientProfileRepository } from '../../repositories/profile/patientProfileRepository';
import { AppError } from '../../utils/appError';
import type { ErrorInfo, SuccessInfo } from '../../models/api';
import type { PatientProfileModel } from '../../models/profile';
import { useProfileStore } from '../../stores/profile';

export const createPatientProfileController = ({ repository }: { repository: PatientProfileRepository }) => {
  return () => {
    // State
    const [profile, setProfile] = useState<PatientProfileModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [success, setSuccess] = useState<SuccessInfo | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Profile store
    const saveProfile = useProfileStore((state) => state.setProfile);

    // Fetch patient profile
    const fetchProfile = useCallback(async (): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const profileData = await repository.getPatient();
        setProfile(profileData);
        saveProfile(profileData); // Save to store
        return true;
      } catch (err: any) {
        console.error('[Patient Profile Controller] Failed to fetch profile:', err);
        
        if (err instanceof AppError) {
          setError({
            message: err.message,
            title: err.title,
            subtitle: err.subtitle,
          });
          return false;
        }

        setError({ message: err?.message || 'Failed to load patient profile', title: 'Error' });
        return false;
      } finally {
        setLoading(false);
      }
    }, [repository]);

    // Update patient profile
    const updateProfile = useCallback(async (data: Partial<PatientProfileModel>): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await repository.updatePatient(data);
        
        // Re-fetch profile after update
        await fetchProfile();

        setSuccess({
          message: 'Patient profile updated successfully',
          title: 'Success',
        });

        return true;
      } catch (err: any) {
        console.error('[Patient Profile Controller] Failed to update profile:', err);

        if (err instanceof AppError) {
          setError({
            message: err.message,
            title: err.title,
            subtitle: err.subtitle,
          });
          return false;
        }

        setError({ message: err?.message || 'Failed to update patient profile', title: 'Error' });
        return false;
      } finally {
        setLoading(false);
      }
    }, [repository, fetchProfile]);

    // Clear messages
    const clearMessages = useCallback(() => {
      setError(null);
      setSuccess(null);
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
      fetchProfile();
    }, [fetchProfile]);

    return {
      // State
      profile,
      loading,
      error,
      success,
      isEditing,

      // Actions
      setIsEditing,
      fetchProfile,
      updateProfile,
      clearMessages,
    };
  };
};

export type PatientProfileController = ReturnType<ReturnType<typeof createPatientProfileController>>;
