import React, { useState } from 'react';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import Dropdown from '../../../components/Dropdown';
import Alert from '../../../components/Alert';
import type { CreateHospitalStaffPayload } from '../../../models/hospitalStaff/payload';
import { useHospitalStaffController } from '../../../hooks/hospitalStaff';
import { ROLES, type UserRole } from '../../../constants/profile';
import { useHospitalStaffProfileController } from '../../../hooks/profile';

interface CreateHospitalStaffProps {
  onSuccess?: () => void;
}

export const CreateHospitalStaff: React.FC<CreateHospitalStaffProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(ROLES.HOSPITAL_SUB_ADMIN);

  const { createHospitalStaff, loading, error, success, clearMessages, setError } = useHospitalStaffController();
  const { profile } = useHospitalStaffProfileController();  // to get hospital_id for staff creation
  
  const roleOptions = [
    { value: ROLES.HOSPITAL_SUB_ADMIN, label: 'Sub Admin' },
    { value: ROLES.HOSPITAL_FRONT_DESK, label: 'Front Desk' },
    { value: ROLES.HOSPITAL_LAB_TECHNICIAN, label: 'Lab Technician' },
    { value: ROLES.HOSPITAL_PHARMACIST, label: 'Pharmacist' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    try {
      const hospitalId = profile?.hospitalId;
      if (!hospitalId) {
        setError('Hospital ID not found in profile');
        return;
      }

      const payload: CreateHospitalStaffPayload = {
        email,
        role,
        hospital_id: hospitalId,
      };
      await createHospitalStaff(payload);

      // reset form state
      setEmail('');
      setRole(ROLES.HOSPITAL_SUB_ADMIN);

      // optional success callbacke if provided
      // can be used to switch tabs or refresh list
      onSuccess?.();
    } catch (err) {
      // handled in controller
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Hospital Staff</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a new staff account for your hospital.</p>
      </div>

      {success && <Alert type="success" title="Success" message={success} onClose={clearMessages} />}
      {error && <Alert type="error" title="Error" message={error} onClose={clearMessages} />}

      <form onSubmit={handleSubmit} className="space-y-6 mt-2 max-w-2xl">
        <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" disabled={loading} />

        <Dropdown label="Role" options={roleOptions} value={role} onChange={(v) => setRole(v as UserRole)} disabled={loading} />

        <div className="pt-4">
          <Button type="submit" disabled={loading || !email}>
            {loading ? 'Creating...' : 'Create Staff'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHospitalStaff;
