import { useEffect, useState } from "react";
import { FaPills, FaTimes } from "react-icons/fa";
import LabeledInputField from "../../../components/LabeledInputField";
import Button from "../../../components/Button";
import type { CreateMedicineRequest } from "../../../models/Medicine";

interface CreateMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMedicineRequest) => Promise<void>;
  loading?: boolean;
}

function CreateMedicineModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: CreateMedicineModalProps) {
  const [form, setForm] = useState<CreateMedicineRequest>({
    name: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "" });
    }
  }, [isOpen]);

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
              <div className="p-2 bg-green-100 rounded-full">
                <FaPills className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Add Medicine</h3>
                <p className="text-sm text-gray-500">
                  Add a new medicine to the system
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Close create medicine modal"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <LabeledInputField
              title="Medicine Name"
              name="name"
              placeholder="Enter medicine name (e.g., Paracetamol)"
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
                label="Add Medicine"
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

export default CreateMedicineModal;
