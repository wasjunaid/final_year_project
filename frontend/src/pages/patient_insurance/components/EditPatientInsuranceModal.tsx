import { useState, useEffect } from "react";
import { FaEdit, FaTimes, FaShieldAlt } from "react-icons/fa";
import { usePatientInsurance } from "../../../hooks/usePatientInsurance";
import Button from "../../../components/Button";
import LabeledInputField from "../../../components/LabeledInputField";
import type { PatientInsurance } from "../../../models/PatientInsurance";

interface EditPatientInsuranceModalProps {
  insurance: PatientInsurance | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function EditPatientInsuranceModal({
  insurance,
  isOpen,
  onClose,
  onSuccess,
}: EditPatientInsuranceModalProps) {
  const { updateInsurance, updating, isInsuranceNumberExists, clearMessages } =
    usePatientInsurance();

  const [formData, setFormData] = useState({
    insurance_number: 0,
    is_primary: false,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Update form data when insurance changes
  useEffect(() => {
    if (insurance) {
      setFormData({
        insurance_number: insurance.insurance_number,
        is_primary: insurance.is_primary,
      });
      setFormErrors({});
    }
  }, [insurance]);

  // Validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.insurance_number || formData.insurance_number <= 0) {
      errors.insurance_number = "Valid insurance number is required";
    } else if (
      insurance &&
      isInsuranceNumberExists(
        formData.insurance_number,
        insurance.patient_insurance_id
      )
    ) {
      errors.insurance_number = "This insurance number already exists";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insurance) return;

    clearMessages();

    if (!validateForm()) {
      return;
    }

    const success = await updateInsurance(insurance.patient_insurance_id, {
      insurance_number: formData.insurance_number,
      is_primary: formData.is_primary,
    });

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({ insurance_number: 0, is_primary: false });
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
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <FaEdit className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit Insurance Policy
                </h2>
                <p className="text-sm text-gray-500">
                  Update insurance information
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
            {/* Insurance Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Insurance ID: #{insurance.patient_insurance_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Added: {new Date(insurance.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Insurance Number */}
            <LabeledInputField
              title="Insurance Number"
              name="insurance_number"
              type="number"
              value={formData.insurance_number.toString()}
              onChange={handleInputChange}
              placeholder="Enter insurance policy number"
              required
              hint="Your insurance policy number (must be unique)"
              error={formErrors.insurance_number}
            />

            {/* Primary Insurance Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_primary"
                name="is_primary"
                checked={formData.is_primary}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_primary"
                className="text-sm font-medium text-gray-700"
              >
                Set as Primary Insurance
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Primary insurance will be used first for claims processing
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                label={updating ? "Updating..." : "Update Insurance"}
                icon={<FaEdit />}
                type="submit"
                disabled={updating || !formData.insurance_number}
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
            {formData.is_primary && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Setting this as primary will make all
                  other insurance policies secondary.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default EditPatientInsuranceModal;
