import React, { useState } from 'react';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Dropdown from '../../../components/Dropdown';
import Alert from '../../../components/Alert';
import { ROLES, type UserRole } from '../../../constants/profile';
import { useSystemAdminUserManagementController } from '../../../hooks/systemAdminUserManagement';
import { useHospitalController } from '../../../hooks/hospital/useHospitalController';


interface CreateUserProps {
  onSuccess?: () => void;
}

export const CreateUser: React.FC<CreateUserProps> = ({ onSuccess }) => {
  const [userType, setUserType] = useState<UserRole>(ROLES.SYSTEM_SUB_ADMIN);
  const [email, setEmail] = useState('');
  const [hospitalId, setHospitalId] = useState('');

  const { createSystemSubAdmin, createHospitalAdmin, loading, error, success, clearMessages } = useSystemAdminUserManagementController();
  const { hospitals } = useHospitalController();

  const userTypeOptions = [
    { value: ROLES.SYSTEM_SUB_ADMIN, label: 'System Sub Admin' },
    { value: ROLES.HOSPITAL_ADMIN, label: 'Hospital Admin' },
  ];

  const hospitalOptions = [
    { value: '', label: 'Select a hospital' },
    ...hospitals.map((hospital) => ({
      value: hospital.hospital_id.toString(),
      label: hospital.name,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    try {
      if (userType === ROLES.SYSTEM_SUB_ADMIN) {
        await createSystemSubAdmin({ email });
      } else {
        await createHospitalAdmin({
          email,
          hospital_id: parseInt(hospitalId),
          role: ROLES.HOSPITAL_ADMIN,
        });
      }

      // Reset form
      setEmail('');
      setHospitalId('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is already handled in the controller
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create New User
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Add a new system admin or hospital admin. Password will be auto-generated and sent to their email.
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert
          type="success"
          title="Success"
          message={success}
          onClose={clearMessages}
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={clearMessages}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* User Type Selector */}
        <Dropdown
          label="User Type"
          options={userTypeOptions}
          value={userType}
          onChange={(value) => {
            setUserType(value as UserRole);
            if (value === ROLES.SYSTEM_SUB_ADMIN) {
              setHospitalId('');
            }
          }}
          disabled={loading}
        />

        {/* Hospital Selector - Only shown for hospital admins */}
        {userType === ROLES.HOSPITAL_ADMIN && (
          <Dropdown
            label="Hospital"
            options={hospitalOptions}
            value={hospitalId}
            onChange={(value) => setHospitalId(value)}
            searchable
            searchPlaceholder="Search hospitals..."
            disabled={loading}
          />
        )}

        {/* Email */}
        <TextInput
          label="Email"
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          disabled={loading}
        />

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={
              loading ||
              !email ||
              (userType === ROLES.HOSPITAL_ADMIN && !hospitalId)
            }
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
};
