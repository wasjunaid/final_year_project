import { useEffect, useState } from "react";
import { FaPrescriptionBottleAlt, FaTimes } from "react-icons/fa";
import LabeledInputField from "../../../components/LabeledInputField";
import Button from "../../../components/Button";
import type { CreatePrescriptionRequest } from "../../../models/Prescription";

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePrescriptionRequest) => Promise<void>;
  medicines: any[];
  loading?: boolean;
}

function CreatePrescriptionModal({
  isOpen,
  onClose,
  onSubmit,
  medicines,
  loading,
}: CreatePrescriptionModalProps) {
  const [form, setForm] = useState<CreatePrescriptionRequest>({
    appointment_id: 0,
    medicine_id: 0,
    dosage: "",
    instruction: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setForm({
        appointment_id: 0,
        medicine_id: 0,
        dosage: "",
        instruction: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "appointment_id" || name === "medicine_id"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.appointment_id ||
      !form.medicine_id ||
      !form.dosage.trim() ||
      !form.instruction.trim()
    ) {
      return;
    }

    await onSubmit({
      ...form,
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
              <div className="p-2 bg-indigo-100 rounded-full">
                <FaPrescriptionBottleAlt className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Create Prescription</h3>
                <p className="text-sm text-gray-500">
                  Add a new prescription for a patient
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Close create prescription modal"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <LabeledInputField
              title="Appointment ID"
              name="appointment_id"
              type="number"
              placeholder="Enter appointment ID"
              value={form.appointment_id || ""}
              onChange={handleChange}
              required
            />

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Medicine
              </span>
              <select
                name="medicine_id"
                value={form.medicine_id || ""}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                label="Create Prescription"
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

export default CreatePrescriptionModal;
