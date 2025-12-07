import { useState, useCallback, useEffect } from 'react';
import type { MedicalCoderModel } from '../../models/medicalCoder';
import type { IMedicalCoderRepository } from '../../repositories/medicalCoder';

/**
 * Medical Coder Management Controller Interface
 */
export interface IMedicalCoderManagementController {
  // State
  medicalCoder: MedicalCoderModel | null;
  loading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchMedicalCoder: () => Promise<void>;
  updateHospitalAssociation: () => Promise<void>;
  removeHospitalAssociation: (medicalCoderId: number) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Create Medical Coder Management Controller Hook
 * Factory function that creates a hook with dependency injection
 */
export const createUseMedicalCoderManagementController = (
  repository: IMedicalCoderRepository
) => {
  return (): IMedicalCoderManagementController => {
    const [medicalCoder, setMedicalCoder] = useState<MedicalCoderModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    /**
     * Clear success and error messages
     */
    const clearMessages = useCallback(() => {
      setError(null);
      setSuccess(null);
    }, []);

    /**
     * Fetch medical coder information
     */
    const fetchMedicalCoder = useCallback(async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const data = await repository.getMedicalCoder();
        setMedicalCoder(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch medical coder information';
        setError(errorMessage);
        console.error('Error fetching medical coder:', err);
      } finally {
        setLoading(false);
      }
    }, [repository]);

    /**
     * Update medical coder's hospital association
     */
    const updateHospitalAssociation = useCallback(async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const updatedMedicalCoder = await repository.updateHospitalAssociation();
        setMedicalCoder(updatedMedicalCoder);
        setSuccess('Hospital association updated successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update hospital association';
        setError(errorMessage);
        console.error('Error updating hospital association:', err);
      } finally {
        setLoading(false);
      }
    }, [repository]);

    /**
     * Remove medical coder's hospital association (for hospital admin)
     */
    const removeHospitalAssociation = useCallback(async (medicalCoderId: number) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const updatedMedicalCoder = await repository.removeHospitalAssociation(medicalCoderId);
        setMedicalCoder(updatedMedicalCoder);
        setSuccess('Hospital association removed successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove hospital association';
        setError(errorMessage);
        console.error('Error removing hospital association:', err);
      } finally {
        setLoading(false);
      }
    }, [repository]);

    /**
     * Auto-fetch medical coder on mount
     */
    useEffect(() => {
      fetchMedicalCoder();
    }, [fetchMedicalCoder]);

    return {
      medicalCoder,
      loading,
      error,
      success,
      fetchMedicalCoder,
      updateHospitalAssociation,
      removeHospitalAssociation,
      clearMessages,
    };
  };
};
