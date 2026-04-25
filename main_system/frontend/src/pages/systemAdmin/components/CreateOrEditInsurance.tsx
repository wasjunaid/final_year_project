import React, { useState, useEffect } from 'react';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import { useInsuranceController } from '../../../hooks/insurance';
import type { InsuranceCompanyModel } from '../../../models/insurance';

interface CreateOrEditInsuranceProps {
  editingCompany?: InsuranceCompanyModel | null;
  onSuccess?: () => void;
  onCancelEdit?: () => void;
}

export const CreateOrEditInsurance: React.FC<CreateOrEditInsuranceProps> = ({
  editingCompany,
  onSuccess,
  onCancelEdit,
}) => {
  const [name, setName] = useState('');
  const { createInsuranceCompany, updateInsuranceCompany, loading, error, success, clearMessages } =
    useInsuranceController();

  // Populate form when editing
  useEffect(() => {
    if (editingCompany) {
      setName(editingCompany.name);
    } else {
      setName('');
    }
  }, [editingCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    try {
      if (editingCompany) {
        await updateInsuranceCompany(editingCompany.insurance_company_id, { name });
      } else {
        await createInsuranceCompany({ name });
      }
      
      setName('');
      onSuccess?.();
    } catch (err) {
      // Error is handled by the controller
    }
  };

  const handleCancel = () => {
    setName('');
    clearMessages();
    onCancelEdit?.();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {editingCompany ? 'Update Insurance Company' : 'Create Insurance Company'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {editingCompany
            ? 'Update the insurance company details below.'
            : 'Add a new insurance company to the system.'}
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert type="success" title="Success" message={success} onClose={clearMessages} />
      )}

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Error" message={error} onClose={clearMessages} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <TextInput
          label="Company Name"
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter insurance company name"
          disabled={loading}
        />

        <div className="pt-4 flex gap-3">
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Saving...' : editingCompany ? 'Update Company' : 'Create Company'}
          </Button>

          {editingCompany && (
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Back
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
