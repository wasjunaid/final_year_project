import React from 'react';
import { 
  Calendar, 
  FolderOpen, 
  TestTube, 
  Shield, 
  FileText,
  Bell, 
  User 
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { useNotificationController } from '../../hooks/notification';
import type { SidebarConfig } from '../../models/sidebar/model';

// Import patient pages
import NotificationsPage from '../notifications/NotificationsPage';
import PatientProfilePage from '../patient/PatientProfilePage';
import { PatientDocumentsPage } from '../patient/PatientDocumentsPage';
import { PatientInsurancePage } from '../patient/PatientInsurancePage';

const PatientPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

  const patientSidebarConfig: SidebarConfig = {
    portalName: 'Patient Portal',
    mainNavItems: [
      { icon: Calendar, label: 'Appointments', route: 'appointments' },
      { icon: TestTube, label: 'Lab Results', route: 'lab-tests' },
      { icon: Shield, label: 'Insurance', route: 'insurance' },
      { icon: FolderOpen, label: 'Medical Records', route: 'documents' },
      { icon: FileText, label: 'Access Requests', route: 'ehr' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'My Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'appointments':
        return <div className="p-6"><h1 className="text-2xl font-bold">Appointments - Coming Soon</h1></div>;
      case 'lab-tests':
        return <div className="p-6"><h1 className="text-2xl font-bold">Lab tests - Coming Soon</h1></div>;
      case 'insurance':
        return <PatientInsurancePage />;
      case 'documents':
        return <PatientDocumentsPage />
      case 'ehr':
        return <div className="p-6"><h1 className="text-2xl font-bold">Access Requests - Coming Soon</h1></div>;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <PatientProfilePage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
              <h1 className="text-2xl font-bold">Patient Portal</h1>
          </div>
        );
    }
  };

  return (
    <BasePortal sidebarConfig={patientSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default PatientPortal;
