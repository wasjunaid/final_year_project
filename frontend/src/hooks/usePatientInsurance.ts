import { useState, useEffect } from "react";
import { PatientInsuranceApi } from "../services/patientInsuranceApi";
import type {
  PatientInsurance,
  CreatePatientInsuranceRequest,
  UpdatePatientInsuranceRequest,
} from "../models/PatientInsurance";

export function usePatientInsurance() {
  const [insurances, setInsurances] = useState<PatientInsurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Loading states for individual operations
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // GET - Fetch all patient insurances
  const fetchInsurances = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await PatientInsuranceApi.getPatientInsurances();

      // Based on your backend structure: response.data contains the array
      setInsurances(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setInsurances([]);
        return;
      }
      console.error("Error fetching patient insurances:", err);
      setError(
        err.response?.data?.message || "Failed to fetch patient insurances"
      );
    } finally {
      setLoading(false);
    }
  };

  // POST - Create new patient insurance
  const createInsurance = async (
    data: CreatePatientInsuranceRequest
  ): Promise<boolean> => {
    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await PatientInsuranceApi.createPatientInsurance(data);

      // Add the new insurance to the list
      setInsurances((prev) => [...prev, response.data]);
      setSuccess("Patient insurance added successfully");

      return true;
    } catch (err: any) {
      console.error("Error creating patient insurance:", err);
      setError(
        err.response?.data?.message || "Failed to add patient insurance"
      );
      return false;
    } finally {
      setCreating(false);
    }
  };

  // PUT - Update existing patient insurance
  const updateInsurance = async (
    patient_insurance_id: number,
    data: UpdatePatientInsuranceRequest
  ): Promise<boolean> => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await PatientInsuranceApi.updatePatientInsurance(
        patient_insurance_id,
        data
      );

      // Update the insurance in the list
      setInsurances((prev) =>
        prev.map((insurance) =>
          insurance.patient_insurance_id === patient_insurance_id
            ? {
                ...insurance,
                ...response.data,
                updated_at: new Date().toISOString(),
              }
            : insurance
        )
      );

      // If setting as primary, update other insurances to not be primary
      if (data.is_primary) {
        setInsurances((prev) =>
          prev.map((insurance) =>
            insurance.patient_insurance_id !== patient_insurance_id
              ? { ...insurance, is_primary: false }
              : insurance
          )
        );
      }

      setSuccess("Patient insurance updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error updating patient insurance:", err);
      setError(
        err.response?.data?.message || "Failed to update patient insurance"
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // DELETE - Delete patient insurance
  const deleteInsurance = async (
    patient_insurance_id: number
  ): Promise<boolean> => {
    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await PatientInsuranceApi.deletePatientInsurance(patient_insurance_id);

      // Remove the insurance from the list
      setInsurances((prev) =>
        prev.filter(
          (insurance) => insurance.patient_insurance_id !== patient_insurance_id
        )
      );
      setSuccess("Patient insurance deleted successfully");

      return true;
    } catch (err: any) {
      console.error("Error deleting patient insurance:", err);
      setError(
        err.response?.data?.message || "Failed to delete patient insurance"
      );
      return false;
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to get a specific insurance by ID
  const getInsuranceById = (
    patient_insurance_id: number
  ): PatientInsurance | undefined => {
    return insurances.find(
      (insurance) => insurance.patient_insurance_id === patient_insurance_id
    );
  };

  // Helper function to get primary insurance
  const getPrimaryInsurance = (): PatientInsurance | undefined => {
    return insurances.find((insurance) => insurance.is_primary);
  };

  // Helper function to get secondary insurances
  const getSecondaryInsurances = (): PatientInsurance[] => {
    return insurances.filter((insurance) => !insurance.is_primary);
  };

  // Helper function to check if insurance number exists
  const isInsuranceNumberExists = (
    insurance_number: number,
    excludeId?: number
  ): boolean => {
    return insurances.some(
      (insurance) =>
        insurance.insurance_number === insurance_number &&
        insurance.patient_insurance_id !== excludeId
    );
  };

  // Helper function to get verified insurances
  const getVerifiedInsurances = (): PatientInsurance[] => {
    return insurances.filter((insurance) => insurance.is_verified);
  };

  // Helper function to get unverified insurances
  const getUnverifiedInsurances = (): PatientInsurance[] => {
    return insurances.filter((insurance) => !insurance.is_verified);
  };

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchInsurances();
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return {
    // Data
    insurances,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Messages
    error,
    success,

    // Operations
    fetchInsurances, // Refetch all insurances
    createInsurance, // Create new insurance
    updateInsurance, // Update existing insurance
    deleteInsurance, // Delete insurance

    // Utilities
    getInsuranceById, // Get insurance by ID
    getPrimaryInsurance, // Get primary insurance
    getSecondaryInsurances, // Get secondary insurances
    getVerifiedInsurances, // Get verified insurances
    getUnverifiedInsurances, // Get unverified insurances
    isInsuranceNumberExists, // Check if insurance number exists
    clearMessages, // Clear error/success messages

    // Computed properties
    hasInsurances: insurances.length > 0,
    insuranceCount: insurances.length,
    primaryInsuranceCount: insurances.filter((i) => i.is_primary).length,
    verifiedInsuranceCount: insurances.filter((i) => i.is_verified).length,
    unverifiedInsuranceCount: insurances.filter((i) => !i.is_verified).length,
  };
}

// Type for the hook return value (for better TypeScript support)
export type UsePatientInsuranceReturn = ReturnType<typeof usePatientInsurance>;

// Default export for backward compatibility
export default usePatientInsurance;
