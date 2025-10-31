
import { FaEdit, FaTimes, FaShieldAlt } from "react-icons/fa";
import Button from "../../../components/Button";
import LabeledInputField from "../../../components/LabeledInputField";
import type { PatientInsurance } from "../../../models/PatientInsurance";
// import { usePatientInsurance } from "../../../hooks/usePatientInsurance";


interface EditPatientInsuranceModalProps {
  insurance: PatientInsurance;
  isOpen: boolean;
  onClose: () => void;
}

function EditPatientInsuranceModal(props: EditPatientInsuranceModalProps) {
  const { insurance, isOpen, onClose } = props;
  // No update logic needed; modal is read-only
  // If policy_number is editable, allow editing, otherwise keep as read-only
  // For now, make it read-only (most insurance numbers are not editable)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };
  const handleClose = () => {
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

            {/* Policy Number (read-only) */}
            <LabeledInputField
              title="Policy Number"
              value={insurance.policy_number}
              readOnly
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                label="Close"
                icon={<FaTimes />}
                type="button"
                onClick={handleClose}
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
