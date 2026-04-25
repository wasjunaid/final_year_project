import React from 'react';
import { 
  Pill,
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
import PharmacistDashboard from '../pharmacist/PharmacistDashboard';

const PharmacistPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

  const pharmacistSidebarConfig: SidebarConfig = {
    portalName: 'Pharmacist',
    mainNavItems: [
      { icon: Pill, label: 'Medicine Management', route: 'medicines' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'medicines':
        return <PharmacistDashboard />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <GenericProfilePage />;
      default:
        return <PharmacistDashboard />;
    }
  };

  return (
    <BasePortal sidebarConfig={pharmacistSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default PharmacistPortal;
