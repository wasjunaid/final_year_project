import React, { useMemo } from 'react';
import type { NavbarConfig } from '../../../models/navbar/model';
import { useNavbarController } from '../../../hooks/ui/navbar';
import { AssociatedDoctorsList, AssociatedMedicalCodersList, RequestsList, CreateHospitalAssociationRequest } from './components';

const HospitalAssociationPage: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Associations',
    tabs: [
      { label: 'Doctors', value: 'doctors' },
      { label: 'Medical Coders', value: 'coders' },
      { label: 'Requests', value: 'requests' },
      { label: 'Add', value: 'add' },
    ],
  }), []);

  const { activeTab = 'doctors' } = useNavbarController(navbarConfig);

  return (
    <div className="flex flex-1 flex-col min-h-full">
      {activeTab === 'doctors' && <AssociatedDoctorsList />}
      {activeTab === 'coders' && <AssociatedMedicalCodersList />}
      {activeTab === 'requests' && <RequestsList />}
      {activeTab === 'add' && <CreateHospitalAssociationRequest />}
    </div>
  );
};

export default HospitalAssociationPage;
