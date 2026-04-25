import { useMemo } from "react";
import type { NavbarConfig } from "../../models/navbar/model";
import { useNavbarController } from "../../hooks/ui/navbar";
import { SystemSubAdminsList, HospitalAdminsList, CreateUser } from "./components";

export const UserManagementDashboard: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'User Management Dashboard',
    tabs: [
      { label: 'System Admins', value: 'system' },
      { label: 'Hospital Admins', value: 'hospital' },
      { label: 'Create User', value: 'create' },
    ],
  }), []);

  const { activeTab = 'system' } = useNavbarController(navbarConfig);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* System Sub Admins Tab */}
      {activeTab === 'system' && <SystemSubAdminsList />}

      {/* Hospital Admins Tab */}
      {activeTab === 'hospital' && <HospitalAdminsList />}

      {/* Create User Tab */}
      {activeTab === 'create' && <CreateUser />}
    </div>
  );
};
