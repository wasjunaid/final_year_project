import React from 'react';
import { 
  Building2,
  Users, 
  UserCog,
  Calendar, 
  TestTube,
  FolderOpen, 
  Bell, 
  User 
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { useNotificationController } from '../../hooks/notification';
import type { SidebarConfig } from '../../models/sidebar/model';

// Import pages
import NotificationsPage from '../notifications/NotificationsPage';
import GenericProfilePage from '../profile/GenericProfilePage';

const HospitalAdminPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

  const hospitalAdminSidebarConfig: SidebarConfig = {
    portalName: 'Hospital Admin',
    mainNavItems: [
      { icon: Building2, label: 'Dashboard', route: 'dashboard' },
      { icon: Calendar, label: 'Appointments', route: 'appointments' },
      { icon: TestTube, label: 'Lab Tests', route: 'lab-tests' },
      { icon: Users, label: 'Staff Management', route: 'staff' },
      { icon: UserCog, label: 'Doctor Panel', route: 'doctors' },
      { icon: FolderOpen, label: 'Documents', route: 'documents' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <div className="p-6"><h1 className="text-2xl font-bold">Hospital Dashboard - Coming Soon</h1></div>;
      case 'appointments':
        return <div className="p-6"><h1 className="text-2xl font-bold">Appointments - Coming Soon</h1></div>;
      case 'lab-tests':
        return <div className="p-6"><h1 className="text-2xl font-bold">Lab Tests - Coming Soon</h1></div>;
      case 'staff':
        return <div className="p-6"><h1 className="text-2xl font-bold">Staff Management - Coming Soon</h1></div>;
      case 'doctors':
        return <div className="p-6"><h1 className="text-2xl font-bold">Doctor Panel - Coming Soon</h1></div>;
      case 'documents':
        return <div className="p-6"><h1 className="text-2xl font-bold">Documents - Coming Soon</h1></div>;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <GenericProfilePage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold">Hospital Admin Portal</h1>
          </div>
        )
    }
  };

  return (
    <BasePortal sidebarConfig={hospitalAdminSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default HospitalAdminPortal;
