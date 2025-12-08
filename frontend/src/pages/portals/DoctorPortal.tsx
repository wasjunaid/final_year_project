import React from 'react';
import { 
  Calendar, 
  Bell, 
  User, 
  UserCog
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { useNotificationController } from '../../hooks/notification';
import type { SidebarConfig } from '../../models/sidebar/model';

// Import doctor pages
import NotificationsPage from '../notifications/NotificationsPage';
import DoctorProfilePage from '../doctor/DoctorProfilePage';
import PersonAssociationRequestsPage from '../associationRequest/PersonAssociationRequestsPage';

const DoctorPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

  const doctorSidebarConfig: SidebarConfig = {
    portalName: 'Doctor Portal',
    mainNavItems: [
      { icon: Calendar, label: 'Appointments', route: 'appointments' },
      { icon: UserCog, label: 'Association', route: 'association' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  // Render the appropriate page based on current route
  const renderPage = () => {
    switch (currentPage) {
      case 'appointments':
        return <div className="p-6"><h1 className="text-2xl font-bold">Appointments - Coming Soon</h1></div>;
      case 'association':
        return <PersonAssociationRequestsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <DoctorProfilePage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold">Doctor Portal</h1>
          </div>
        )
    }
  };

  return (
    <BasePortal sidebarConfig={doctorSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default DoctorPortal;
