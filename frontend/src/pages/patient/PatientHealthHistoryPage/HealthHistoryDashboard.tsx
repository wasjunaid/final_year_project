import React, { useMemo } from 'react';
import { useNavbarController } from '../../../hooks/ui/navbar';
import type { NavbarConfig } from '../../../models/navbar/model';
import { 
  MedicalHistoryView, 
  AllergiesView, 
  FamilyHistoryView, 
  SurgicalHistoryView, 
  AddHistoryForm 
} from './components';

const HealthHistoryDashboard: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'My Health History',
    tabs: [
      { label: 'Medical History', value: 'medical' },
      { label: 'Allergies', value: 'allergies' },
      { label: 'Family History', value: 'family' },
      { label: 'Surgical History', value: 'surgical' },
      { label: 'Add History', value: 'add' },
    ],
  }), []);

  const { activeTab = 'medical' } = useNavbarController(navbarConfig);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {activeTab === 'medical' && <MedicalHistoryView />}
      {activeTab === 'allergies' && <AllergiesView />}
      {activeTab === 'family' && <FamilyHistoryView />}
      {activeTab === 'surgical' && <SurgicalHistoryView />}
      {activeTab === 'add' && <AddHistoryForm />}
    </div>
  );
};

export default HealthHistoryDashboard;
