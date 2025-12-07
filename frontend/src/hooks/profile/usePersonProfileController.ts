import { useState, useCallback, useEffect } from 'react';
import type { PersonProfileRepository } from '../../repositories/profile/personProfileRepository';
import { AppError } from '../../utils/appError';
import type { ErrorInfo, SuccessInfo } from '../../models/api';
import type { PersonProfileModel } from '../../models/profile';
import { useProfileStore } from '../../stores/profile';

export const createPersonProfileController = ({ repository }: { repository: PersonProfileRepository }) => {
  return () => {
    // State
    const [profile, setProfile] = useState<PersonProfileModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [success, setSuccess] = useState<SuccessInfo | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Profile store
    const saveProfile = useProfileStore((state) => state.setProfile);

    // Fetch person profile
    const fetchProfile = useCallback(async (): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const profileData = await repository.getPerson();
        setProfile(profileData);
        saveProfile(profileData); // Save to store
        return true;
      } catch (err: any) {
        console.error('[Person Profile Controller] Failed to fetch profile:', err);
        
        if (err instanceof AppError) {
          setError({
            message: err.message,
            title: err.title,
            subtitle: err.subtitle,
          });
          return false;
        }

        setError({ message: err?.message || 'Failed to load profile', title: 'Error' });
        return false;
      } finally {
        setLoading(false);
      }
    }, [repository]);

    // Update person profile
    const updateProfile = useCallback(async (data: Partial<PersonProfileModel>): Promise<boolean> => {
      try {
        console.log('[usePersonProfileController] updateProfile called with data:', data);
        setLoading(true);
        setError(null);
        setSuccess(null);

        const result = await repository.updatePerson(data);
        console.log('[usePersonProfileController] Repository returned:', result);
        
        // Re-fetch profile after update
        await fetchProfile();

        setSuccess({
          message: 'Profile updated successfully',
          title: 'Success',
        });

        return true;
      } catch (err: any) {
        console.error('[Person Profile Controller] Failed to update profile:', err);

        if (err instanceof AppError) {
          setError({
            message: err.message,
            title: err.title,
            subtitle: err.subtitle,
          });
          return false;
        }

        setError({ message: err?.message || 'Failed to update profile', title: 'Error' });
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

export type PersonProfileController = ReturnType<ReturnType<typeof createPersonProfileController>>;
