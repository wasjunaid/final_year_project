import { useState, useEffect } from 'react';
import type { PatientInsuranceModel, InsuranceCompanyModel } from '../../models/insurance/model';
import type { CreatePatientInsurancePayload, UpdatePatientInsurancePayload } from '../../models/insurance/payload';

// Factory to create patient insurance controller hook with DI for repositories
export const createUsePatientInsuranceController = ({
  patientInsuranceRepository,
  insuranceRepository,
}: {
  patientInsuranceRepository: any;
  insuranceRepository: any;
}) => {
  return () => {
    const [patientInsurances, setPatientInsurances] = useState<PatientInsuranceModel[]>([]);
    const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompanyModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch all patient insurances
    const fetchPatientInsurances = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await patientInsuranceRepository.getAllPatientInsurances();
        setPatientInsurances(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch patient insurances');
      } finally {
        setLoading(false);
      }
    };

    // Fetch all insurance companies
    const fetchInsuranceCompanies = async () => {
      try {
        const data = await insuranceRepository.getAllInsuranceCompanies();
        setInsuranceCompanies(data);
      } catch (err: any) {
        console.error('Failed to fetch insurance companies:', err);
        // Don't set error state for this background fetch
      }
    };

    // Create patient insurance
    const createPatientInsurance = async (payload: CreatePatientInsurancePayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const newInsurance = await patientInsuranceRepository.createPatientInsurance(payload);
        setPatientInsurances((prev) => [...prev, newInsurance]);
        setSuccess('Insurance added successfully!');

        return newInsurance;
      } catch (err: any) {
        setError(err.message || 'Failed to add insurance');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Update patient insurance (only is_primary can be updated)
    const updatePatientInsurance = async (
      patientInsuranceId: number,
      payload: UpdatePatientInsurancePayload
    ) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await patientInsuranceRepository.updatePatientInsurance(
          patientInsuranceId,
          payload
        );
        
        // Refetch all insurances to get the updated state
        // (backend may have updated other insurances, e.g., demoting old primary)
        const updatedInsurances = await patientInsuranceRepository.getAllPatientInsurances();
        setPatientInsurances(updatedInsurances);
        setSuccess('Insurance updated successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to update insurance');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Delete patient insurance
    const deletePatientInsurance = async (patientInsuranceId: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await patientInsuranceRepository.deletePatientInsurance(patientInsuranceId);
        setPatientInsurances((prev) =>
          prev.filter((insurance) => insurance.patient_insurance_id !== patientInsuranceId)
        );
        setSuccess('Insurance deleted successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to delete insurance');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Verify patient insurance
    const verifyPatientInsurance = async (patientInsuranceId: number) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await patientInsuranceRepository.verifyPatientInsurance(patientInsuranceId);
        setSuccess('Verification request sent successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to send verification request');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Clear messages
    const clearMessages = () => {
      setError(null);
      setSuccess(null);
    };

    // Auto-fetch on mount
    useEffect(() => {
      fetchPatientInsurances();
      fetchInsuranceCompanies();
    }, []);

    return {
      patientInsurances,
      insuranceCompanies,
      loading,
      error,
      success,
      fetchPatientInsurances,
      createPatientInsurance,
      updatePatientInsurance,
      deletePatientInsurance,
      verifyPatientInsurance,
      clearMessages,
    };
  };
};
