import { useState, useEffect } from "react";
import { FaEdit, FaTimes, FaBuilding } from "react-icons/fa";
import { useInsuranceCompanies } from "../../../hooks/useInsuranceCompanies";
import Button from "../../../components/Button";
import LabeledInputField from "../../../components/LabeledInputField";
import type { InsuranceCompany } from "../../../models/InsuranceCompany";

interface EditInsuranceCompanyModalProps {
  company: InsuranceCompany | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function EditInsuranceCompanyModal({
  company,
  isOpen,
  onClose,
  onSuccess,
}: EditInsuranceCompanyModalProps) {
  const { updateCompany, updating, isCompanyNameExists, clearMessages } =
    useInsuranceCompanies();

  const [formData, setFormData] = useState({
    name: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Update form data when company changes
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
      });
      setFormErrors({});
    }
  }, [company]);

  // Validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Company name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Company name must be at least 2 characters";
    } else if (formData.name.trim().length > 255) {
      errors.name = "Company name must not exceed 255 characters";
    } else if (
      company &&
      isCompanyNameExists(formData.name.trim(), company.insurance_company_id)
    ) {
      errors.name = "A company with this name already exists";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    clearMessages();

    if (!validateForm()) {
      return;
    }

    const success = await updateCompany(company.insurance_company_id, {
      name: formData.name.trim(),
    });

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({ name: "" });
    setFormErrors({});
    clearMessages();
    onClose();
  };

  if (!isOpen || !company) return null;

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
                <FaEdit className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit Insurance Company
                </h2>
                <p className="text-sm text-gray-500">
                  Update company information
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
            {/* Company Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <FaBuilding className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Company ID: #{company.insurance_company_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <LabeledInputField
              title="Company Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter insurance company name"
              required
              hint="Company name must be unique and between 2-255 characters"
              error={formErrors.name}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                label={updating ? "Updating..." : "Update Company"}
                icon={<FaEdit />}
                type="submit"
                disabled={updating || !formData.name.trim()}
                className="flex-1"
              />
              <Button
                label="Cancel"
                variant="secondary"
                onClick={handleClose}
                disabled={updating}
                className="flex-1"
              />
            </div>

            {/* Warning */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Updating this company name will affect
                all related insurance records and policies.
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditInsuranceCompanyModal;
