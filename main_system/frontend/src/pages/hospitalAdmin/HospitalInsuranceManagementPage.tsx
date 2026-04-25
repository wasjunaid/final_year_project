import React, { useMemo } from 'react';
import type { NavbarConfig } from '../../models/navbar/model';
import { useNavbarController } from '../../hooks/ui/navbar';
import { HospitalPanelList } from './components/HospitalPanelList';
import { AddHospitalPanel } from './components/AddHospitalPanel';

export const HospitalInsuranceManagementPage: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Insurance Panel Management',
    tabs: [
      { label: 'Panel List', value: 'list' },
      { label: 'Add Insurance', value: 'add' },
    ],
  }), []);

  const { activeTab = 'list' } = useNavbarController(navbarConfig);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {activeTab === 'list' && (
        <HospitalPanelList />
      )}

      {activeTab === 'add' && (
        <AddHospitalPanel />
      )}
    </div>
  );
};

export default HospitalInsuranceManagementPage;
