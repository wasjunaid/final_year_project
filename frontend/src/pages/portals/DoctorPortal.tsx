import React from 'react';
import { 
  Calendar, 
  Users, 
  FolderOpen, 
  TestTube, 
  Shield, 
  BarChart3, 
  Bell, 
  User 
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useNavigationStore } from '../../stores/navigation/navigationStore';
import type { SidebarConfig } from '../../models/navigation/model';

// Import all page components
import AppointmentsDashboardPage from '../appointment/AppointmentsDashboardPage';
import AppointmentPendingPage from '../appointment/AppointmentPendingPage';
import AppointmentConfirmedPage from '../appointment/AppointmentConfirmedPage';
import AppointmentUpcomingPage from '../appointment/AppointmentUpcomingPage';
import AppointmentOngoingPage from '../appointment/AppointmentOngoingPage';
import AppointmentCompletedPage from '../appointment/AppointmentCompletedPage';
import PatientsPage from '../patients/PatientsPage';
import DocumentsPage from '../documents/DocumentsPage';
import LabTestsPage from '../labTests/LabTestsPage';
import InsurancePage from '../insurance/InsurancePage';
import ReportsPage from '../reports/ReportsPage';
import NotificationsPage from '../notifications/NotificationsPage';
import ProfilePage from '../profile/ProfilePage';

const doctorSidebarConfig: SidebarConfig = {
  portalName: 'Doctor Portal',
  mainNavItems: [
    { icon: Calendar, label: 'Appointments', route: 'appointments' },
    { icon: Users, label: 'Patients', route: 'patients' },
    { icon: FolderOpen, label: 'Documents', route: 'documents' },
    { icon: TestTube, label: 'Lab Tests', route: 'lab-tests' },
    { icon: Shield, label: 'Insurance', route: 'insurance' },
    { icon: BarChart3, label: 'Reports', route: 'reports' },
  ],
  bottomNavItems: [
    { icon: Bell, label: 'Notifications', route: 'notifications', badge: 3 },
    { icon: User, label: 'Profile', route: 'profile' },
  ],
};

const DoctorPortal: React.FC = () => {
  const { currentRoute } = useNavigationStore();

  // Render the appropriate page based on current route
  const renderPage = () => {
    switch (currentRoute) {
      case 'appointments':
        return <AppointmentsDashboardPage />;
      case 'appointments-pending':
        return <AppointmentPendingPage />;
      case 'appointments-confirmed':
        return <AppointmentConfirmedPage />;
      case 'appointments-upcoming':
        return <AppointmentUpcomingPage />;
      case 'appointments-ongoing':
        return <AppointmentOngoingPage />;
      case 'appointments-completed':
        return <AppointmentCompletedPage />;
      case 'patients':
        return <PatientsPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'lab-tests':
        return <LabTestsPage />;
      case 'insurance':
        return <InsurancePage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <AppointmentsDashboardPage />;
    }
  };

  return (
    <BasePortal portalType="doctor" sidebarConfig={doctorSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default DoctorPortal;
