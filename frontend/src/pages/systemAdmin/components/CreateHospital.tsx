import React, { useState } from 'react';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import type { HospitalFormData } from '../../../models/hospital';
import { useHospitalController } from '../../../hooks/hospital';

export const CreateHospital: React.FC = () => {
  const [formData, setFormData] = useState<HospitalFormData>({
    name: '',
  });
  
  const { createHospital, loading, error, success, clearMessages } = useHospitalController();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear messages on change
    clearMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const result = await createHospital(formData.name);
    
    if (result) {
      setFormData({ name: '' });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Hospital
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Register a new hospital in the system
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearMessages}
          className="mb-6"
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={clearMessages}
          className="mb-6"
        />
      )}

      <div className="bg-white dark:bg-[#272829] rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            label="Hospital Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter hospital name"
            disabled={loading}
            helperText="Enter the full legal name of the hospital"
            minWidth="100%"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.name.trim()}
            fullWidth
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Hospital'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Important Notes:
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>Hospital name must be unique in the system</li>
            <li>Once created, hospital admin can be assigned to manage it</li>
            <li>Hospital name can be updated later if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
