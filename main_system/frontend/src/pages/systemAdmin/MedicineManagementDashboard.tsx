import { useMemo } from 'react';
import type { NavbarConfig } from '../../models/navbar/model';
import { useNavbarController } from '../../hooks/ui/navbar';
import { MedicinesList, CreateMedicine } from './components';

export const MedicineManagementDashboard: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Medicine Management Dashboard',
    tabs: [
      { label: 'All Medicines', value: 'list' },
      { label: 'Add Medicine', value: 'create' },
    ],
  }), []);

  const { activeTab = 'list' } = useNavbarController(navbarConfig);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* Medicines List Tab */}
      {activeTab === 'list' && <MedicinesList />}

      {/* Create Medicine Tab */}
      {activeTab === 'create' && <CreateMedicine />}
    </div>
  );
};
