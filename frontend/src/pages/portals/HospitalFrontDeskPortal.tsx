import React from 'react';
import { 
  Calendar,
  Bell, 
  User, 
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { useNotificationController } from '../../hooks/notification';
import type { SidebarConfig } from '../../models/sidebar/model';

// Import pages
import NotificationsPage from '../notifications/NotificationsPage';
import GenericProfilePage from '../profile/GenericProfilePage';
import DocumentUploadDashboard from '../documents/DocumentUploadDashboard';
import AppointmentsDashboard from '../appointments/AppointmentsDashboard';

const HospitalFrontDeskPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

    const frontDeskSidebarConfig: SidebarConfig = {
    portalName: 'Front Desk',
    mainNavItems: [
      { icon: Calendar, label: 'Appointments', route: 'appointments' },
      // { icon: UserPlus, label: 'Patient Registration', route: 'registration' },
      // { icon: ClipboardCheck, label: 'Check-In', route: 'check-in' },
      // { icon: Users, label: 'Patient List', route: 'patients' },
      // { icon: FolderOpen, label: 'Documents', route: 'documents' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'appointments':
        return <AppointmentsDashboard />
      case 'documents':
        return <DocumentUploadDashboard />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <GenericProfilePage />;
      default:
        <div className="flex items-center justify-center h-full">
          <h1 className="text-2xl font-bold">Hospital Front Desk Portal</h1>
        </div>;
    }
  };

  return (
    <BasePortal sidebarConfig={frontDeskSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default HospitalFrontDeskPortal;
