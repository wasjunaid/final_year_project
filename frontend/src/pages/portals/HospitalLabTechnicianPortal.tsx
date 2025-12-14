import React from 'react';
import { 
  Bell, 
  User, 
  FolderOpen
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { useNotificationController } from '../../hooks/notification';
import type { SidebarConfig } from '../../models/sidebar/model';

// Import pages
import NotificationsPage from '../notifications/NotificationsPage';
import GenericProfilePage from '../profile/GenericProfilePage';
import LabTechDashboard from '../labtech/LabTechDashboard';

const HospitalLabTechnicianPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

  const labTechnicianSidebarConfig: SidebarConfig = {
    portalName: 'Lab Technician',
    mainNavItems: [
      { icon: FolderOpen, label: 'Documents', route: 'documents' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'documents':
        return <LabTechDashboard />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <GenericProfilePage />;
      default:
        <LabTechDashboard />;
        // return (
        //   <div className="flex items-center justify-center h-full">
        //     <h1 className="text-2xl font-bold">Hospital Lab Technician Portal</h1>
        //   </div>
        // )
    }
  };

  return (
    <BasePortal sidebarConfig={labTechnicianSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default HospitalLabTechnicianPortal;
