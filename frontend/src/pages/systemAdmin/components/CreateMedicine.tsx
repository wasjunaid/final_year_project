import React, { useState } from 'react';
import { Pill, Plus } from 'lucide-react';
import { useMedicineController } from '../../../hooks/medicine';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';

export const CreateMedicine: React.FC = () => {
  const { createMedicine, loading, error, clearError } = useMedicineController();
  const [name, setName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    try {
      await createMedicine(name.trim());
      setSuccessMessage(`Medicine "${name}" added successfully!`);
      setName('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      // Error is already set by the controller
    }
  };

  const handleReset = () => {
    setName('');
    clearError();
    setSuccessMessage('');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-[#2b2b2b] rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Pill className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add New Medicine
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add a new medicine to the system database
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4">
              <Alert message={error} type="error" onClose={clearError} />
            </div>
          )}

          {successMessage && (
            <div className="mb-4">
              <Alert message={successMessage} type="success" onClose={() => setSuccessMessage('')} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="Medicine Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paracetamol, Ibuprofen, Amoxicillin"
              required
              helperText="Enter the generic or brand name of the medicine"
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleReset}
                disabled={loading}
                variant="outline"
                fullWidth
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                variant="primary"
                loading={loading}
                fullWidth
                icon={Plus}
              >
                Add Medicine
              </Button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Quick Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Make sure the medicine name is accurate and matches standard medical databases</li>
              <li>Check the "All Medicines" tab to avoid duplicate entries</li>
              <li>Use generic names when possible for better standardization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
