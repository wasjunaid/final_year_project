import React from 'react';
import type { PatientInsuranceModel } from '../../../../models/insurance/model';
import { InsuranceCard } from './InsuranceCard';
import Alert from '../../../../components/Alert';
import { Shield } from 'lucide-react';

interface InsurancesListProps {
  patientInsurances: PatientInsuranceModel[];
  loading: boolean;
  error: string | null;
  success: string | null;
  onDelete: (insuranceId: number) => void;
  onVerify: (insuranceId: number) => void;
  onDeactivate: (insuranceId: number) => void;
  clearMessages: () => void;
}

export const InsurancesList: React.FC<InsurancesListProps> = ({
  patientInsurances,
  loading,
  error,
  success,
  onDelete,
  onVerify,
  onDeactivate,
  clearMessages,
}) => {
  // Separate primary and secondary insurances
  const primaryInsurance = patientInsurances.find((ins) => ins.is_primary);
  const secondaryInsurances = patientInsurances.filter((ins) => !ins.is_primary);

  if (loading && patientInsurances.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Error Alert */}
      {error && (
        <>
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={clearMessages}
          />
          <div className="mb-4" />
        </>
      )}

      {/* Success Alert */}
      {success && (
        <>
          <Alert
            type="success"
            title="Success"
            message={success}
            onClose={clearMessages}
          />
          <div className="mb-4" />
        </>
      )}

      {/* Empty State */}
      {patientInsurances.length === 0 && !loading && (
        <div className="text-center py-16">
          <Shield className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={80} />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No Insurance Added
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Add your insurance information to get started
          </p>
          <div className="text-sm text-gray-500">
            Click on the "Add Insurance" tab to add your first insurance
          </div>
        </div>
      )}

      {/* Insurance Cards Grid */}
      {patientInsurances.length > 0 && (
        <div className="space-y-6">
          {/* Primary Insurance Section */}
          {primaryInsurance && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Primary Insurance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InsuranceCard
                  insurance={primaryInsurance}
                  onDelete={onDelete}
                  onVerify={onVerify}
                  onDeactivate={onDeactivate}
                />
              </div>
            </div>
          )}

          {/* Secondary Insurances Section */}
          {secondaryInsurances.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Secondary Insurance{secondaryInsurances.length > 1 ? 's' : ''}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {secondaryInsurances.map((insurance) => (
                  <InsuranceCard
                    key={insurance.patient_insurance_id}
                    insurance={insurance}
                    onDelete={onDelete}
                    onVerify={onVerify}
                    onDeactivate={onDeactivate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
