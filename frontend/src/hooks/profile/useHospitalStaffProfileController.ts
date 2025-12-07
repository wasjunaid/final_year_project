import { useState, useCallback, useEffect } from 'react';
import type { HospitalStaffProfileRepository } from '../../repositories/profile/hospitalStaffProfileRepository';
import { AppError } from '../../utils/appError';
import type { ErrorInfo, SuccessInfo } from '../../models/api';
import type { HospitalStaffProfileModel } from '../../models/profile';

export const createHospitalStaffProfileController = ({ repository }: { repository: HospitalStaffProfileRepository }) => {
  return () => {
    // State
    const [profile, setProfile] = useState<HospitalStaffProfileModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [success, setSuccess] = useState<SuccessInfo | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch hospital staff profile
    const fetchProfile = useCallback(async (): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const profileData = await repository.getHospitalStaff();
        setProfile(profileData);
        return true;
      } catch (err: any) {
        console.error('[Hospital Staff Profile Controller] Failed to fetch profile:', err);
        
        if (err instanceof AppError) {
          setError({
            message: err.message,
            title: err.title,
            subtitle: err.subtitle,
          });
          return false;
        }

        setError({ message: err?.message || 'Failed to load hospital staff profile', title: 'Error' });
        return false;
      } finally {
        setLoading(false);
      }
    }, [repository]);

    // Update hospital staff profile
    const updateProfile = useCallback(async (data: Partial<HospitalStaffProfileModel>): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await repository.updateHospitalStaff(data);
        
        // Re-fetch profile after update
        await fetchProfile();

        setSuccess({
          message: 'Hospital staff profile updated successfully',
          title: 'Success',
        });

        return true;
      } catch (err: any) {
        console.error('[Hospital Staff Profile Controller] Failed to update profile:', err);

        if (err instanceof AppError) {
          setError({
            message: err.message,
            title: err.title,
            subtitle: err.subtitle,
          });
          return false;
        }

        setError({ message: err?.message || 'Failed to update hospital staff profile', title: 'Error' });
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

export type HospitalStaffProfileController = ReturnType<ReturnType<typeof createHospitalStaffProfileController>>;
