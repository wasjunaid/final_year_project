import { useState, useCallback, useEffect } from 'react';
import type { MedicalCoderProfileRepository } from '../../repositories/profile/medicalCoderProfileRepository';
import { AppError } from '../../utils/appError';
import type { ErrorInfo, SuccessInfo } from '../../models/api';
import type { MedicalCoderProfileModel } from '../../models/profile';
import { useProfileStore } from '../../stores/profile';

export const createMedicalCoderProfileController = ({ repository }: { repository: MedicalCoderProfileRepository }) => {
  return () => {
    // State
    const [profile, setProfile] = useState<MedicalCoderProfileModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [success, setSuccess] = useState<SuccessInfo | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Profile store
    const saveProfile = useProfileStore((state) => state.setProfile);

    // Fetch medical coder profile
    const fetchProfile = useCallback(async (): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const profileData = await repository.getMedicalCoder();
        setProfile(profileData);
        saveProfile(profileData); // Save to store
        return true;
      } catch (err: any) {
        console.error('[Medical Coder Profile Controller] Failed to fetch profile:', err);
        
        if (err instanceof AppError) {
          setError({
            message: err.message,
            title: err.title,
            subtitle: err.subtitle,
          });
          return false;
        }

        setError({ message: err?.message || 'Failed to load medical coder profile', title: 'Error' });
        return false;
      } finally {
        setLoading(false);
      }
    }, [repository]);

    // Update medical coder profile
    const updateProfile = useCallback(async (data: Partial<MedicalCoderProfileModel>): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await repository.updateMedicalCoder(data);
        
        // Re-fetch profile after update
        await fetchProfile();

        setSuccess({
          message: 'Medical coder profile updated successfully',
          title: 'Success',
        });

        return true;
      } catch (err: any) {
        console.error('[Medical Coder Profile Controller] Failed to update profile:', err);

        if (err instanceof AppError) {
          setError({
            message: err.message,
            title: err.title,
            subtitle: err.subtitle,
          });
          return false;
        }

        setError({ message: err?.message || 'Failed to update medical coder profile', title: 'Error' });
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

export type MedicalCoderProfileController = ReturnType<ReturnType<typeof createMedicalCoderProfileController>>;
