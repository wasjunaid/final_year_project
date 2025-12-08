import React, { useMemo } from 'react';
import type { NavbarConfig } from '../../models/navbar/model';
import { useNavbarController } from '../../hooks/ui/navbar';
import { CreateHospitalStaff } from './components/CreateHospitalStaff';
import { HospitalStaffList } from './components/HospitalStaffList';
import { useHospitalStaffProfileController } from '../../hooks/profile';

export const HospitalStaffManagementPage: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Staff Management',
    tabs: [
      { label: 'Staff List', value: 'list' },
      { label: 'Create Staff', value: 'create' },
    ],
  }), []);

  const { activeTab = 'list' } = useNavbarController(navbarConfig);

  useHospitalStaffProfileController(); // Ensure profile is loaded for staff management

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {activeTab === 'list' && (
        <HospitalStaffList />
      )}

      {activeTab === 'create' && (
        <CreateHospitalStaff />
      )}
    </div>
  );
};

export default HospitalStaffManagementPage;
