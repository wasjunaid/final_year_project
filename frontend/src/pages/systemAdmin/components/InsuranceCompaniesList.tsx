import React from 'react';
import Table from '../../../components/Table';
import { useInsuranceController } from '../../../hooks/insurance';
import type { InsuranceCompanyModel } from '../../../models/insurance';
import Alert from '../../../components/Alert';

interface InsuranceCompaniesListProps {
  onEdit?: (company: InsuranceCompanyModel) => void;
}

export const InsuranceCompaniesList: React.FC<InsuranceCompaniesListProps> = ({ onEdit }) => {
  const { insuranceCompanies, loading, error, clearMessages } = useInsuranceController();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && insuranceCompanies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Error Alert */}
      {error && (
        <>
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={clearMessages}
          />
          <div className="mb-2" />
        </>
      )}

      <Table
        columns={[
          {
            key: 'insurance_company_id',
            header: 'ID',
            render: (company: InsuranceCompanyModel) => company.insurance_company_id,
          },
          {
            key: 'name',
            header: 'Company Name',
            render: (company: InsuranceCompanyModel) => (
              <span className="font-medium capitalize">{company.name}</span>
            ),
          },
          {
            key: 'created_at',
            header: 'Created',
            render: (company: InsuranceCompanyModel) => formatDate(company.created_at),
          },
          {
            key: 'updated_at',
            header: 'Last Updated',
            render: (company: InsuranceCompanyModel) => formatDate(company.updated_at),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (company: InsuranceCompanyModel) => (
              <button
                onClick={() => onEdit?.(company)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Edit
              </button>
            ),
          },
        ]}
        data={insuranceCompanies}
        itemsPerPage={10}
        emptyMessage="No insurance companies found"
      />
    </>
  );
};
