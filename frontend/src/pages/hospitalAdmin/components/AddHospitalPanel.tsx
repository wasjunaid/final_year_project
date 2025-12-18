import React, { useState } from 'react';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import { useHospitalPanelListController } from '../../../hooks/hospitalPanelList';
import { useInsuranceController } from '../../../hooks/insurance';
import Dropdown from '../../../components/Dropdown';

export const AddHospitalPanel: React.FC = () => {
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | null>(null);
  const { addToHospitalPanel, loading: panelLoading, error, success, clearMessages } = useHospitalPanelListController();
  const { insuranceCompanies, loading: insuranceLoading } = useInsuranceController();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!selectedInsuranceId) {
      return;
    }

    try {
      await addToHospitalPanel({ insurance_company_id: selectedInsuranceId });
      setSelectedInsuranceId(null);
    } catch {
      // Error is handled by the controller
    }
  };

  const insuranceOptions = insuranceCompanies.map((company) => ({
    value: company.insurance_company_id.toString(),
    label: company.name.charAt(0).toUpperCase() + company.name.slice(1),
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Add Insurance Company to Panel
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Select an insurance company to add to your hospital's panel list.
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <>
          <Alert type="success" title="Success" message={success} onClose={clearMessages} />
          <div className="mb-4" />
        </>
      )}

      {/* Error Alert */}
      {error && (
        <>
          <Alert type="error" title="Error" message={error} onClose={clearMessages} />
          <div className="mb-4" />
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Dropdown
          label="Insurance Company"
          id="insurance_company"
          options={insuranceOptions}
          value={selectedInsuranceId?.toString() || ''}
          onChange={(value: string) => {
            setSelectedInsuranceId(value ? parseInt(value, 10) : null);
          }}
          disabled={panelLoading || insuranceLoading}
          placeholder="Select an insurance company"
        />

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={panelLoading || insuranceLoading || !selectedInsuranceId}
          >
            {panelLoading ? 'Adding...' : 'Add to Panel'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddHospitalPanel;
