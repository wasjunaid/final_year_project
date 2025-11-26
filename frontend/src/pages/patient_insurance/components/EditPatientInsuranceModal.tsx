import { useState, useEffect } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import { usePatientInsurance } from "../../../hooks/usePatientInsurance";
import { useInsuranceCompanies } from "../../../hooks/useInsuranceCompanies";
import type { InsuranceCompany } from "../../../models/InsuranceCompany";
import type { PatientInsurance, UpdatePatientInsuranceRequest } from "../../../models/PatientInsurance";
import Button from "../../../components/Button";
import LabeledInputField from "../../../components/LabeledInputField";

interface EditPatientInsuranceModalProps {
  isOpen: boolean;
  insurance: PatientInsurance | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function EditPatientInsuranceModal({
  isOpen,
  insurance,
  onClose,
  onSuccess,
}: EditPatientInsuranceModalProps) {
  const { update, loading, error, clearMessages } = usePatientInsurance();
  const { items: companies } = useInsuranceCompanies();

  const [formData, setFormData] = useState<{
    insurance_number: string;
    policy_holder_name: string;
    relationship_to_holder: 'self' | 'spouse' | 'parent' | 'child' | 'other' | '';
    group_number: string;
    effective_date: string;
    expiration_date: string;
    insurance_company_id: string;
    is_primary: boolean;
    is_active: boolean;
  }>({
    insurance_number: "",
    policy_holder_name: "",
    relationship_to_holder: "",
    group_number: "",
    effective_date: "",
    expiration_date: "",
    insurance_company_id: "",
    is_primary: false,
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Populate form when insurance changes
  useEffect(() => {
    if (insurance) {
      setFormData({
        insurance_number: insurance.insurance_number || "",
        policy_holder_name: insurance.policy_holder_name || "",
        relationship_to_holder: insurance.relationship_to_holder || "",
        group_number: insurance.group_number || "",
        effective_date: insurance.effective_date 
          ? new Date(insurance.effective_date).toISOString().split('T')[0]
          : "",
        expiration_date: insurance.expiration_date
          ? new Date(insurance.expiration_date).toISOString().split('T')[0]
          : "",
        insurance_company_id: insurance.insurance_company_id?.toString() || "",
        is_primary: insurance.is_primary || false,
        is_active: insurance.is_verified !== undefined ? insurance.is_verified : true,
      });
    }
  }, [insurance]);

  // Validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.insurance_number.trim()) {
      errors.insurance_number = "Insurance number is required";
    }

    if (!formData.policy_holder_name.trim()) {
      errors.policy_holder_name = "Policy holder name is required";
    }

    if (!formData.relationship_to_holder) {
      errors.relationship_to_holder = "Relationship is required";
    }

    if (!formData.insurance_company_id) {
      errors.insurance_company_id = "Please select an insurance company";
    }

    // Validate dates if provided
    if (formData.effective_date && formData.expiration_date) {
      const effectiveDate = new Date(formData.effective_date);
      const expirationDate = new Date(formData.expiration_date);
      if (expirationDate <= effectiveDate) {
        errors.expiration_date = "Expiration date must be after effective date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!insurance || !validateForm()) {
      return;
    }

    const requestData: UpdatePatientInsuranceRequest = {
      insurance_number: formData.insurance_number.trim(),
      policy_holder_name: formData.policy_holder_name.trim(),
      relationship_to_holder: formData.relationship_to_holder as 'self' | 'spouse' | 'parent' | 'child' | 'other',
      insurance_company_id: Number(formData.insurance_company_id),
      is_primary: formData.is_primary,
      is_active: formData.is_active,
    };

    // Add optional fields if provided
    if (formData.group_number.trim()) {
      requestData.group_number = formData.group_number.trim();
    }
    if (formData.effective_date) {
      requestData.effective_date = formData.effective_date;
    }
    if (formData.expiration_date) {
      requestData.expiration_date = formData.expiration_date;
    }

    const success = await update(insurance.patient_insurance_id, requestData);

    if (success) {
      if (onSuccess) onSuccess();
      handleClose();
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle close
  const handleClose = () => {
    setFormErrors({});
    clearMessages();
    onClose();
  };

  if (!isOpen || !insurance) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <FaEdit className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit Insurance Policy
                </h2>
                <p className="text-sm text-gray-500">
                  Update your insurance policy information
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Insurance Company */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Insurance Company <span className="text-red-500">*</span>
              </label>
              <select
                name="insurance_company_id"
                value={formData.insurance_company_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.insurance_company_id
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              >
                <option value="">Select an insurance company</option>
                {(companies as InsuranceCompany[]).map((company) => (
                  <option
                    key={company.insurance_company_id}
                    value={company.insurance_company_id}
                  >
                    {company.name}
                  </option>
                ))}
              </select>
              {formErrors.insurance_company_id && (
                <span className="text-xs text-red-600 font-medium">
                  {formErrors.insurance_company_id}
                </span>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Insurance Number */}
              <LabeledInputField
                title="Insurance Number"
                name="insurance_number"
                type="text"
                value={formData.insurance_number}
                onChange={handleInputChange}
                placeholder="Enter insurance number"
                required
                hint="Your unique insurance policy number"
                error={formErrors.insurance_number}
              />

              {/* Group Number */}
              <LabeledInputField
                title="Group Number"
                name="group_number"
                type="text"
                value={formData.group_number}
                onChange={handleInputChange}
                placeholder="Enter group number (optional)"
                hint="Group number if applicable"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Policy Holder Name */}
              <LabeledInputField
                title="Policy Holder Name"
                name="policy_holder_name"
                type="text"
                value={formData.policy_holder_name}
                onChange={handleInputChange}
                placeholder="Enter policy holder name"
                required
                hint="Full name of the policy holder"
                error={formErrors.policy_holder_name}
              />

              {/* Relationship to Holder */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Relationship to Holder <span className="text-red-500">*</span>
                </label>
                <select
                  name="relationship_to_holder"
                  value={formData.relationship_to_holder}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.relationship_to_holder
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="self">Self</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.relationship_to_holder && (
                  <span className="text-xs text-red-600 font-medium">
                    {formErrors.relationship_to_holder}
                  </span>
                )}
              </div>
            </div>

            {/* Two Column Layout for Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Effective Date */}
              <LabeledInputField
                title="Effective Date"
                name="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={handleInputChange}
                placeholder="Select effective date"
                hint="When coverage begins (optional)"
              />

              {/* Expiration Date */}
              <LabeledInputField
                title="Expiration Date"
                name="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={handleInputChange}
                placeholder="Select expiration date"
                hint="When coverage ends (optional)"
                error={formErrors.expiration_date}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <input
                  type="checkbox"
                  id="is_primary"
                  name="is_primary"
                  checked={formData.is_primary}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_primary" className="text-sm font-medium text-gray-700">
                  Set as Primary Insurance
                </label>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Insurance is Active
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                label={loading ? "Updating..." : "Update Insurance"}
                icon={<FaEdit />}
                type="submit"
                disabled={loading}
                className="flex-1"
              />
              <Button
                label="Cancel"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditPatientInsuranceModal;
