import React from 'react';
import { 
  Users, 
  Building2,
  FolderOpen, 
  BarChart3,
  Bell, 
  User,
  Database,
  // Pill
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { useNotificationController } from '../../hooks/notification';
import type { SidebarConfig } from '../../models/sidebar/model';

// Import admin pages
import NotificationsPage from '../notifications/NotificationsPage';
import GenericProfilePage from '../profile/GenericProfilePage';
import { HospitalManagementDashboard } from '../systemAdmin/HospitalManagementDashboard';
import { UserManagementDashboard } from '../systemAdmin/UserManagementDashboard';
import { InsuranceManagementDashboard } from '../systemAdmin/InsuranceManagementDashboard';
import { LogsManagementDashboard } from '../systemAdmin/LogsManagementDashboard';
import { MedicineManagementDashboard } from '../systemAdmin/MedicineManagementDashboard';
import BlockchainHistoryPage from '../blockchainHistory/BlockchainHistoryPage';

const SystemAdminPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

  const adminSidebarConfig: SidebarConfig = {
    portalName: 'Admin Portal',
    mainNavItems: [
      { icon: BarChart3, label: 'Logs', route: 'logs' },
      { icon: Building2, label: 'Hospitals Management', route: 'hospitals' },
      { icon: Users, label: 'Users Management', route: 'users' },
      { icon: FolderOpen, label: 'Insurances', route: 'insurances' },
      // { icon: Pill, label: 'Medicine Management', route: 'medicines' },
      { icon: Database, label: 'Blockchain History', route: 'blockchain-history' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'logs':
        return <LogsManagementDashboard />;
      case 'users':
        return <UserManagementDashboard />;
      case 'hospitals':
        return <HospitalManagementDashboard />;
      case 'insurances':
        return <InsuranceManagementDashboard />;
      case 'medicines':
        return <MedicineManagementDashboard />;
      case 'blockchain-history':
        return <BlockchainHistoryPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <GenericProfilePage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold">System Admin Portal</h1>
          </div>
        )
    }
  };

  return (
    <BasePortal sidebarConfig={adminSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default SystemAdminPortal;
