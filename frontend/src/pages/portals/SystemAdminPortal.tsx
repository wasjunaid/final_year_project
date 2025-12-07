import React from 'react';
import { 
  Users, 
  Building2,
  FolderOpen, 
  BarChart3,
  Bell, 
  User, 
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
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'logs':
        return <div className="p-6"><h1 className="text-2xl font-bold">Logs Overview - Coming Soon</h1></div>;
      case 'users':
        return <UserManagementDashboard />;
      case 'hospitals':
        return <HospitalManagementDashboard />;
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
