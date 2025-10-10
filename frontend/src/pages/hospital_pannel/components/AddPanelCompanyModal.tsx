import { useState, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import type { InsuranceCompany } from "../../../models/InsuranceCompany";

interface AddPanelCompanyModalProps {
  isOpen: boolean;
  companies: InsuranceCompany[];
  onClose: () => void;
  onAdd: (insurance_company_id: number) => Promise<void>;
  loading?: boolean;
}

export default function AddPanelCompanyModal({
  isOpen,
  companies,
  onClose,
  onAdd,
  loading,
}: AddPanelCompanyModalProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedCompanyId("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    await onAdd(Number(selectedCompanyId));
    setSelectedCompanyId("");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <FaPlus className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Add Company to Panel</h3>
                <p className="text-sm text-gray-500">Select a company to add</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Company
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) =>
                  setSelectedCompanyId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select company...</option>
                {companies.map((c) => (
                  <option
                    key={c.insurance_company_id}
                    value={c.insurance_company_id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded border bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white inline-flex items-center gap-2 disabled:opacity-60"
                disabled={loading || !selectedCompanyId}
              >
                <FaPlus />
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
