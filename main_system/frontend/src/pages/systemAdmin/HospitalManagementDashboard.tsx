import { useMemo } from "react";
import type { NavbarConfig } from "../../models/navbar/model";
import { useNavbarController } from "../../hooks/ui/navbar";
import { HospitalsList, CreateHospital } from "./components";

export const HospitalManagementDashboard: React.FC = () => {
  const navbarConfig : NavbarConfig = useMemo(() => ({
    title: 'Hospital Management Dashboard',
    tabs: [
      { label: 'Hospitals', value: 'hospitals' },
      { label: 'Create', value: 'create' },
    ],
  }), []);

  const { activeTab = 'hospitals' } = useNavbarController(navbarConfig);


  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* Hospitals List Tab */}
      {activeTab === 'hospitals' && <HospitalsList />}

      {/* Create Hospital Tab */}
      {activeTab === 'create' && <CreateHospital />}
    </div>
  );
}