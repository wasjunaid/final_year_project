import { useEffect, useState } from "react";
import { FaPills, FaTimes } from "react-icons/fa";
import LabeledInputField from "../../../components/LabeledInputField";
import Button from "../../../components/Button";
import type { Medicine, UpdateMedicineRequest } from "../../../models/Medicine";

interface UpdateMedicineModalProps {
  isOpen: boolean;
  medicine: Medicine;
  onClose: () => void;
  onSubmit: (payload: UpdateMedicineRequest) => Promise<void>;
  loading?: boolean;
}

function UpdateMedicineModal({
  isOpen,
  medicine,
  onClose,
  onSubmit,
  loading,
}: UpdateMedicineModalProps) {
  const [form, setForm] = useState({
    name: "",
  });

  useEffect(() => {
    if (isOpen && medicine) {
      setForm({
        name: medicine.name || "",
      });
    }
  }, [isOpen, medicine]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    await onSubmit({
      medicine_id: medicine.medicine_id,
      name: form.name.trim(),
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <FaPills className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Update Medicine</h3>
                <p className="text-sm text-gray-500">
                  Edit medicine #{medicine.medicine_id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Close update medicine modal"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <LabeledInputField
              title="Medicine Name"
              name="name"
              placeholder="Enter medicine name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                label="Cancel"
                variant="secondary"
                onClick={onClose}
                type="button"
                size="sm"
              />
              <Button
                label="Update Medicine"
                variant="primary"
                type="submit"
                disabled={loading || !form.name.trim()}
                size="sm"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default UpdateMedicineModal;
