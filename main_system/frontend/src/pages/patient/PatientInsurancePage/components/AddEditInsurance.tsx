import React, { useState, useEffect } from 'react';
import type { PatientInsuranceModel, InsuranceCompanyModel } from '../../../../models/insurance/model';
import type { CreatePatientInsurancePayload } from '../../../../models/insurance/payload';
import TextInput from '../../../../components/TextInput';
import Button from '../../../../components/Button';
import Dropdown from '../../../../components/Dropdown';
import Alert from '../../../../components/Alert';

interface AddEditInsuranceProps {
  insuranceCompanies: InsuranceCompanyModel[];
  editingInsurance: PatientInsuranceModel | null;
  onSubmit: (payload: CreatePatientInsurancePayload) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  success: string | null;
  clearMessages: () => void;
}

export const AddEditInsurance: React.FC<AddEditInsuranceProps> = ({
  insuranceCompanies,
  editingInsurance,
  onSubmit,
  onCancel,
  loading,
  error,
  success,
  clearMessages,
}) => {
  const [formData, setFormData] = useState<CreatePatientInsurancePayload>({
    insurance_company_id: 0,
    insurance_number: '',
    policy_holder_name: '',
    relationship_to_holder: 'self',
    is_primary: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (editingInsurance) {
      setFormData({
        insurance_company_id: editingInsurance.insurance_company_id,
        insurance_number: editingInsurance.insurance_number,
        policy_holder_name: editingInsurance.policy_holder_name,
        relationship_to_holder: editingInsurance.relationship_to_holder,
        is_primary: editingInsurance.is_primary,
      });
    } else {
      // Reset form for new insurance
      setFormData({
        insurance_company_id: 0,
        insurance_number: '',
        policy_holder_name: '',
        relationship_to_holder: 'self',
        is_primary: false,
      });
    }
  }, [editingInsurance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    try {
      await onSubmit(formData);
      // Reset form after successful submission (only for new insurance)
      if (!editingInsurance) {
        setFormData({
          insurance_company_id: 0,
          insurance_number: '',
          policy_holder_name: '',
          relationship_to_holder: 'self',
          is_primary: false,
        });
      }
    } catch (err) {
      // Error is handled by the controller
    }
  };

  const insuranceCompanyOptions = [
    { value: '0', label: 'Select Insurance Company' },
    ...insuranceCompanies.map((company) => ({
      value: company.insurance_company_id.toString(),
      label: company.name,
    })),
  ];

  const relationshipOptions = [
    { value: 'self', label: 'Self' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {editingInsurance ? 'Update Insurance' : 'Add New Insurance'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {editingInsurance
            ? 'Only the primary insurance setting can be updated.'
            : 'Fill in your insurance details below.'}
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert
          type="success"
          title="Success"
          message={success}
          onClose={clearMessages}
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={clearMessages}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Insurance Company */}
        <Dropdown
          label="Insurance Company"
          options={insuranceCompanyOptions}
          value={formData.insurance_company_id.toString()}
          onChange={(value) => setFormData((prev) => ({ ...prev, insurance_company_id: parseInt(value) }))}
          searchable
          searchPlaceholder="Search insurance companies..."
          disabled={loading || !!editingInsurance}
        />

        {/* Insurance Number */}
        <TextInput
          label="Insurance Number"
          id="insurance_number"
          name="insurance_number"
          type="text"
          value={formData.insurance_number}
          onChange={(e) => setFormData((prev) => ({ ...prev, insurance_number: e.target.value }))}
          placeholder="Enter your insurance/member ID"
          disabled={loading || !!editingInsurance}
        />

        {/* Policy Holder Name */}
        <TextInput
          label="Policy Holder Name"
          id="policy_holder_name"
          name="policy_holder_name"
          type="text"
          value={formData.policy_holder_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, policy_holder_name: e.target.value }))}
          placeholder="Enter full name of policy holder"
          disabled={loading || !!editingInsurance}
        />

        {/* Relationship to Holder */}
        <Dropdown
          label="Relationship to Holder"
          options={relationshipOptions}
          value={formData.relationship_to_holder}
          onChange={(value) => setFormData((prev) => ({ ...prev, relationship_to_holder: value }))}
          disabled={loading || !!editingInsurance}
        />

        {/* Primary Insurance Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="is_primary"
            checked={formData.is_primary}
            onChange={(e) => setFormData((prev) => ({ ...prev, is_primary: e.target.checked }))}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={loading}
          />
          <div className="flex-1">
            <label
              htmlFor="is_primary"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Set as Primary Insurance
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your primary insurance will be billed first for medical services
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex gap-3">
          <Button
            type="submit"
            disabled={
              loading ||
              formData.insurance_company_id === 0 ||
              !formData.insurance_number ||
              !formData.policy_holder_name
            }
          >
            {loading ? (editingInsurance ? 'Updating...' : 'Adding...') : (editingInsurance ? 'Update Insurance' : 'Add Insurance')}
          </Button>
          {editingInsurance && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddEditInsurance;
