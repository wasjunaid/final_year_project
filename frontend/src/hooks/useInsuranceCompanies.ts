import { useState, useEffect } from "react";
import { InsuranceCompanyApi } from "../services/insuranceCompaniesApi";
import type {
  InsuranceCompany,
  CreateInsuranceCompanyRequest,
  UpdateInsuranceCompanyRequest,
} from "../models/InsuranceCompany";

export const useInsuranceCompanies = () => {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Loading states for individual operations
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // GET - Fetch all insurance companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await InsuranceCompanyApi.getInsuranceCompanies();
      setCompanies(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCompanies([]);
        return;
      }
      setError(
        err.response?.data?.message || "Failed to fetch insurance companies"
      );
    } finally {
      setLoading(false);
    }
  };

  // POST - Create new insurance company
  const createCompany = async (
    data: CreateInsuranceCompanyRequest
  ): Promise<boolean> => {
    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await InsuranceCompanyApi.createInsuranceCompany(data);

      // Add the new company to the list
      setCompanies((prev) => [...prev, response.data as InsuranceCompany]);
      setSuccess("Insurance company created successfully");

      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create insurance company"
      );
      return false;
    } finally {
      setCreating(false);
    }
  };

  // PUT - Update existing insurance company
  const updateCompany = async (
    id: number,
    data: UpdateInsuranceCompanyRequest
  ): Promise<boolean> => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await InsuranceCompanyApi.updateInsuranceCompany(
        id,
        data
      );

      // Update the company in the list
      setCompanies((prev) =>
        prev.map((company) =>
          company.insurance_company_id === id
            ? {
                ...company,
                ...response.data,
                updated_at: new Date().toISOString(),
              }
            : company
        )
      );
      setSuccess("Insurance company updated successfully");

      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update insurance company"
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // DELETE - Delete insurance company
  const deleteCompany = async (id: number): Promise<boolean> => {
    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await InsuranceCompanyApi.deleteInsuranceCompany(id);

      // Remove the company from the list
      setCompanies((prev) =>
        prev.filter((company) => company.insurance_company_id !== id)
      );
      setSuccess("Insurance company deleted successfully");

      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to delete insurance company"
      );
      return false;
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to get a specific company by ID
  const getCompanyById = (id: number): InsuranceCompany | undefined => {
    return companies.find((company) => company.insurance_company_id === id);
  };

  // Helper function to check if company name exists (for validation)
  const isCompanyNameExists = (name: string, excludeId?: number): boolean => {
    return companies.some(
      (company) =>
        company.name.toLowerCase() === name.toLowerCase() &&
        company.insurance_company_id !== excludeId
    );
  };

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchCompanies();
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
    companies,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Messages
    error,
    success,

    // Operations
    fetchCompanies, // Refetch all companies
    createCompany, // Create new company
    updateCompany, // Update existing company
    deleteCompany, // Delete company

    // Utilities
    getCompanyById, // Get company by ID
    isCompanyNameExists, // Check if name exists
    clearMessages, // Clear error/success messages

    // Computed properties
    hasCompanies: companies.length > 0,
    companyCount: companies.length,
  };
};

// Type for the hook return value (for better TypeScript support)
export type UseInsuranceCompaniesReturn = ReturnType<
  typeof useInsuranceCompanies
>;
