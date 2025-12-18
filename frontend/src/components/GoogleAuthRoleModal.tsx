import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import Dropdown from './Dropdown';
import { ROLES, type UserRole } from '../constants/profile';

interface GoogleAuthRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (role: UserRole) => void;
  loading?: boolean;
  isSignUp?: boolean; // Add this prop to distinguish between login and signup
}

const GoogleAuthRoleModal: React.FC<GoogleAuthRoleModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  loading = false,
  isSignUp = false, // Default to login flow
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(ROLES.PATIENT);

  // Different role options based on login vs signup
  const roleOptions = isSignUp 
    ? [
        { value: ROLES.PATIENT, label: 'Patient' },
        { value: ROLES.DOCTOR, label: 'Doctor' },
      ]
    : [
        { value: ROLES.PATIENT, label: 'Patient' },
        { value: ROLES.DOCTOR, label: 'Doctor' },
        { value: ROLES.MEDICAL_CODER, label: 'Medical Coder' },
        { value: ROLES.SYSTEM_ADMIN, label: 'System Admin' },
        { value: ROLES.SYSTEM_SUB_ADMIN, label: 'System Sub Admin' },
        { value: ROLES.HOSPITAL_ADMIN, label: 'Hospital Admin' },
        { value: ROLES.HOSPITAL_SUB_ADMIN, label: 'Hospital Sub Admin' },
        { value: ROLES.HOSPITAL_FRONT_DESK, label: 'Front Desk' },
        { value: ROLES.HOSPITAL_LAB_TECHNICIAN, label: 'Lab Technician' },
      ];

  const handleContinue = () => {
    onContinue(selectedRole);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#2b2b2b] rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Continue with Google
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isSignUp 
              ? 'Please select your role. Only Patient and Doctor accounts can be created via Google.'
              : 'Please select your role to continue with Google authentication.'
            }
          </p>

          <div className="mb-6">
            <Dropdown
              label="Select Role"
              options={roleOptions}
              value={selectedRole}
              onChange={(value) => setSelectedRole(value as UserRole)}
              disabled={loading}
              fullWidth
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={loading}
              loading={loading}
              fullWidth
            >
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthRoleModal;