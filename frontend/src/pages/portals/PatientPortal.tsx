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
import { useNavigationStore } from '../../stores/navigation/navigationStore';
import type { SidebarConfig } from '../../models/navigation/model';

// Import patient-specific pages
import AppointmentsDashboardPage from '../appointment/AppointmentsDashboardPage';
import DocumentsPage from '../documents/DocumentsPage';
import LabTestsPage from '../labTests/LabTestsPage';
import InsurancePage from '../insurance/InsurancePage';
import NotificationsPage from '../notifications/NotificationsPage';
import ProfilePage from '../profile/ProfilePage';

const patientSidebarConfig: SidebarConfig = {
  portalName: 'Patient Portal',
  mainNavItems: [
    { icon: Calendar, label: 'My Appointments', route: 'appointments' },
    { icon: FolderOpen, label: 'My Documents', route: 'documents' },
    { icon: TestTube, label: 'Lab Results', route: 'lab-tests' },
    { icon: Shield, label: 'Insurance', route: 'insurance' },
    { icon: FileText, label: 'Medical History', route: 'medical-history' },
  ],
  bottomNavItems: [
    { icon: Bell, label: 'Notifications', route: 'notifications' },
    { icon: User, label: 'My Profile', route: 'profile' },
  ],
};

const PatientPortal: React.FC = () => {
  const { currentRoute } = useNavigationStore();

  const renderPage = () => {
    switch (currentRoute) {
      case 'appointments':
        return <AppointmentsDashboardPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'lab-tests':
        return <LabTestsPage />;
      case 'insurance':
        return <InsurancePage />;
      case 'medical-history':
        return <div className="p-6"><h1 className="text-2xl font-bold">Medical History - Coming Soon</h1></div>;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <AppointmentsDashboardPage />;
    }
  };

  return (
    <BasePortal portalType="patient" sidebarConfig={patientSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default PatientPortal;
