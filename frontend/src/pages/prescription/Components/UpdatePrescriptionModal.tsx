import { useEffect, useState } from "react";
import { FaPrescriptionBottleAlt, FaTimes } from "react-icons/fa";
import LabeledInputField from "../../../components/LabeledInputField";
import Button from "../../../components/Button";
import type {
  Prescription,
  UpdatePrescriptionRequest,
} from "../../../models/Prescription";

interface UpdatePrescriptionModalProps {
  isOpen: boolean;
  prescription: Prescription;
  onClose: () => void;
  onSubmit: (payload: UpdatePrescriptionRequest) => Promise<void>;
  medicines: any[];
  loading?: boolean;
}

function UpdatePrescriptionModal({
  isOpen,
  prescription,
  onClose,
  onSubmit,
  medicines,
  loading,
}: UpdatePrescriptionModalProps) {
  const [form, setForm] = useState({
    medicine_id: 0,
    dosage: "",
    instruction: "",
  });

  useEffect(() => {
    if (isOpen && prescription) {
      setForm({
        medicine_id: prescription.medicine_id,
        dosage: prescription.dosage,
        instruction: prescription.instruction,
      });
    }
  }, [isOpen, prescription]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "medicine_id" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicine_id || !form.dosage.trim() || !form.instruction.trim()) {
      return;
    }

    await onSubmit({
      prescription_id: prescription.prescription_id,
      medicine_id: form.medicine_id,
      dosage: form.dosage.trim(),
      instruction: form.instruction.trim(),
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <FaPrescriptionBottleAlt className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Update Prescription</h3>
                <p className="text-sm text-gray-500">
                  Edit prescription #{prescription.prescription_id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Close update prescription modal"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Medicine
              </span>
              <select
                name="medicine_id"
                value={form.medicine_id || ""}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select medicine</option>
                {medicines.map((medicine) => (
                  <option
                    key={medicine.medicine_id}
                    value={medicine.medicine_id}
                  >
                    {medicine.name}
                  </option>
                ))}
              </select>
            </label>

            <LabeledInputField
              title="Dosage"
              name="dosage"
              placeholder="e.g., 500mg twice a day"
              value={form.dosage}
              onChange={handleChange}
              required
            />

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Instructions
              </span>
              <textarea
                name="instruction"
                placeholder="e.g., Take after meals"
                value={form.instruction}
                onChange={handleChange}
                rows={3}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                label="Cancel"
                variant="secondary"
                onClick={onClose}
                type="button"
                size="sm"
              />
              <Button
                label="Update Prescription"
                variant="primary"
                type="submit"
                disabled={loading}
                size="sm"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default UpdatePrescriptionModal;
