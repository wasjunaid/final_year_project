import { useEffect, useState } from "react";
import { FaFlask, FaTimes } from "react-icons/fa";
import LabeledInputField from "../../../components/LabeledInputField";
import Button from "../../../components/Button";
import type { CreateLabTestRequest } from "../../../models/LabTest";

interface CreateLabTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLabTestRequest) => Promise<void>;
  loading?: boolean;
}

function CreateLabTestModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: CreateLabTestModalProps) {
  const [form, setForm] = useState<CreateLabTestRequest>({
    name: "",
    description: "",
    category: "",
    preparation: "",
    // cost handled separately
  });
  const [cost, setCost] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setForm({
        name: "",
        description: "",
        category: "",
        preparation: "",
      });
      setCost("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      cost: cost ? Number(cost) : undefined,
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
                <FaFlask className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Create Lab Test</h3>
                <p className="text-sm text-gray-500">
                  Add a new lab test to your catalog
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Close create lab test modal"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <LabeledInputField
              title="Name"
              name="name"
              placeholder="Enter lab test name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <LabeledInputField
              title="Category"
              name="category"
              placeholder="e.g. Hematology"
              value={form.category ?? ""}
              onChange={handleChange}
            />

            <LabeledInputField
              title="Cost"
              name="cost"
              placeholder="Enter cost (optional)"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Description
              </span>
              <textarea
                name="description"
                placeholder="Describe the lab test"
                value={form.description ?? ""}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Preparation / Instructions
              </span>
              <textarea
                name="preparation"
                placeholder="Describe any preparations required"
                value={form.preparation ?? ""}
                onChange={handleChange}
                rows={3}
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
                label="Create"
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

export default CreateLabTestModal;
