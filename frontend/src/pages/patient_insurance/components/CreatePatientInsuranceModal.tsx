
import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { usePatientInsurance } from "../../../hooks/usePatientInsurance";
import { useInsuranceCompanies } from "../../../hooks/useInsuranceCompanies";
import type { InsuranceCompany } from "../../../models/InsuranceCompany";
import Button from "../../../components/Button";
import LabeledInputField from "../../../components/LabeledInputField";


interface CreatePatientInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}


function CreatePatientInsuranceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePatientInsuranceModalProps) {
  const { create, loading, items: existingInsurances, error, clearMessages } = usePatientInsurance();
  const { items: companies } = useInsuranceCompanies();

  const [formData, setFormData] = useState<{ policy_number: string; insurance_company_id: string; coverage_amount: number | "" }>({
    policy_number: "",
    insurance_company_id: "",
    coverage_amount: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});


  // Validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.policy_number || Number(formData.policy_number) <= 0) {
      errors.policy_number = "Valid policy number is required";
    } else if (existingInsurances.some(i => String(i.policy_number) === formData.policy_number)) {
      errors.policy_number = "This policy number already exists";
    }

    if (!formData.insurance_company_id) {
      errors.insurance_company_id = "Please select an insurance company";
    }

    if (formData.coverage_amount === "" || Number(formData.coverage_amount) <= 0) {
      errors.coverage_amount = "Coverage amount is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!validateForm()) {
      return;
    }

    const success = await create({
      policy_number: formData.policy_number,
      insurance_company_id: Number(formData.insurance_company_id),
      coverage_amount: typeof formData.coverage_amount === "number" ? formData.coverage_amount : 0,
    });

    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };


  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "coverage_amount") {
      // Only allow numbers or empty string
      const numValue = value === "" ? "" : Number(value);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
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
  setFormData({ policy_number: "", insurance_company_id: "", coverage_amount: "" });
    setFormErrors({});
    clearMessages();
    onClose();
  };


  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <FaPlus className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Insurance Policy
                </h2>
                <p className="text-sm text-gray-500">
                  Add a new insurance policy to your account
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
            {/* Policy Number */}
            <LabeledInputField
              title="Policy Number"
              name="policy_number"
              type="number"
              value={formData.policy_number}
              onChange={handleInputChange}
              placeholder="Enter your insurance policy number"
              required
              hint="Your unique insurance policy number"
              error={formErrors.policy_number}
            />
            {/* Coverage Amount */}
            <LabeledInputField
              title="Coverage Amount"
              name="coverage_amount"
              type="number"
              value={formData.coverage_amount}
              onChange={handleInputChange}
              placeholder="Enter coverage amount"
              required
              hint="The amount covered by this policy"
              error={formErrors.coverage_amount}
            />

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
              {!formErrors.insurance_company_id && (
                <span className="text-xs text-gray-500">
                  Choose your insurance provider from the list
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                label={loading ? "Adding..." : "Add Insurance"}
                icon={<FaPlus />}
                type="submit"
                disabled={
                  loading ||
                  !formData.policy_number ||
                  !formData.insurance_company_id ||
                  !formData.coverage_amount
                }
                className="flex-1"
              />
              {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
              <Button
                label="Cancel"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              />
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Your first insurance will automatically
                be set as primary. Additional insurances will be secondary and
                can be changed later.
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreatePatientInsuranceModal;
