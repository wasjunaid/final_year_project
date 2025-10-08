import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { usePatientInsurance } from "../../../hooks/usePatientInsurance";
import { useInsuranceCompanies } from "../../../hooks/useInsuranceCompanies";
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
  const { createInsurance, creating, isInsuranceNumberExists, clearMessages } =
    usePatientInsurance();

  const { companies } = useInsuranceCompanies();

  const [formData, setFormData] = useState({
    insurance_number: "",
    insurance_company_id: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.insurance_number || Number(formData.insurance_number) <= 0) {
      errors.insurance_number = "Valid insurance number is required";
    } else if (isInsuranceNumberExists(Number(formData.insurance_number))) {
      errors.insurance_number = "This insurance number already exists";
    }

    if (!formData.insurance_company_id) {
      errors.insurance_company_id = "Please select an insurance company";
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

    const success = await createInsurance({
      insurance_number: Number(formData.insurance_number),
      insurance_company_id: Number(formData.insurance_company_id),
    });

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({ insurance_number: "", insurance_company_id: "" });
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
            {/* Insurance Number */}
            <LabeledInputField
              title="Insurance Number"
              name="insurance_number"
              type="number"
              value={formData.insurance_number}
              onChange={handleInputChange}
              placeholder="Enter your insurance policy number"
              required
              hint="Your unique insurance policy number"
              error={formErrors.insurance_number}
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
                {companies.map((company) => (
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
                label={creating ? "Adding..." : "Add Insurance"}
                icon={<FaPlus />}
                type="submit"
                disabled={
                  creating ||
                  !formData.insurance_number ||
                  !formData.insurance_company_id
                }
                className="flex-1"
              />
              <Button
                label="Cancel"
                variant="secondary"
                onClick={handleClose}
                disabled={creating}
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
