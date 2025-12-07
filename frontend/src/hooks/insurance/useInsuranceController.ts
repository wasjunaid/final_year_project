import { useState, useEffect } from 'react';
import type { InsuranceCompanyModel } from '../../models/insurance/model';
import type { CreateInsuranceCompanyPayload, UpdateInsuranceCompanyPayload } from '../../models/insurance/payload';

// Factory to create insurance controller hook with DI for repository
export const createUseInsuranceController = ({ insuranceRepository }: { insuranceRepository: any }) => {
  return () => {
    const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompanyModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch all insurance companies
    const fetchInsuranceCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await insuranceRepository.getAllInsuranceCompanies();
        setInsuranceCompanies(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch insurance companies');
      } finally {
        setLoading(false);
      }
    };

    // Create insurance company
    const createInsuranceCompany = async (payload: CreateInsuranceCompanyPayload) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const newCompany = await insuranceRepository.createInsuranceCompany(payload);
        setInsuranceCompanies((prev) => [...prev, newCompany]);
        setSuccess('Insurance company created successfully!');
        
        return newCompany;
      } catch (err: any) {
        setError(err.message || 'Failed to create insurance company');
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Update insurance company
    const updateInsuranceCompany = async (
      insuranceCompanyId: number,
      payload: UpdateInsuranceCompanyPayload
    ) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const updatedCompany = await insuranceRepository.updateInsuranceCompany(insuranceCompanyId, payload);
        setInsuranceCompanies((prev) =>
          prev.map((company) =>
            company.insurance_company_id === insuranceCompanyId ? updatedCompany : company
          )
        );
        setSuccess('Insurance company updated successfully!');
        
        return updatedCompany;
      } catch (err: any) {
        setError(err.message || 'Failed to update insurance company');
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
      fetchInsuranceCompanies();
    }, []);

    return {
      insuranceCompanies,
      loading,
      error,
      success,
      fetchInsuranceCompanies,
      createInsuranceCompany,
      updateInsuranceCompany,
      clearMessages,
    };
  };
};
