import React from 'react';
import { 
  Code, 
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
import { MedicalCoderDashboard } from '../medicalCoder';

const MedicalCoderPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

  const medicalCoderSidebarConfig: SidebarConfig = {
    portalName: 'Medical Coder Portal',
    mainNavItems: [
      { icon: Code, label: 'Medical Coding', route: 'coding' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'coding':
        return <MedicalCoderDashboard />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <GenericProfilePage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold">Medical Coder Portal</h1>
          </div>
        )
    }
  };

  return (
    <BasePortal sidebarConfig={medicalCoderSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default MedicalCoderPortal;
