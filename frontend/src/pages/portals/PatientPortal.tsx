import React from 'react';
import { 
  Calendar, 
  FolderOpen, 
  // TestTube, 
  Shield, 
  Bell, 
  User, 
  GitPullRequest,
  FileText,
  Database,
  Wallet,
  CreditCard,
  Pill
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { useNotificationController } from '../../hooks/notification';
import type { SidebarConfig } from '../../models/sidebar/model';

// Import patient pages
import NotificationsPage from '../notifications/NotificationsPage';
import PatientProfilePage from '../patient/PatientProfilePage';
import HealthHistoryDashboard from '../patient/PatientHealthHistoryPage/HealthHistoryDashboard';
import { PatientDocumentsPage } from '../patient/PatientDocumentsPage';
import { PatientInsurancePage } from '../patient/PatientInsurancePage';
import { AccessRequestsPage } from '../accessRequest';
import AppointmentsDashboard from '../appointments/AppointmentsDashboard';
import MyEhrPage from '../patient/MyEhrPage';
import BlockchainHistoryPage from '../blockchainHistory/BlockchainHistoryPage';
import WalletSettingsPage from '../wallet/WalletSettingsPage';
import PaymentHistoryPage from '../payment/PaymentHistoryPage';
import PrescriptionsDashboard from '../prescription/PrescriptionsDashboard';

const PatientPortal: React.FC = () => {
  const { currentPage } = useSidebarController();
  const { unreadCount } = useNotificationController();

  const patientSidebarConfig: SidebarConfig = {
    portalName: 'Patient Portal',
    mainNavItems: [
      { icon: Calendar, label: 'Appointments', route: 'appointments' },
      // { icon: TestTube, label: 'Lab Results', route: 'lab-tests' },
      { icon: FolderOpen, label: 'My Health', route: 'health' },
      { icon: FileText, label: 'My EHR', route: 'my-ehr' },
      { icon: FolderOpen, label: 'Medical Records', route: 'documents' },
      { icon: Pill, label: 'My Prescriptions', route: 'prescriptions' },
      { icon: Shield, label: 'Insurance', route: 'insurance' },
      { icon: GitPullRequest, label: 'EHR Access Requests', route: 'access-requests' },
      { icon: Database, label: 'Blockchain History', route: 'blockchain-history' },
      { icon: Wallet, label: 'Wallet Settings', route: 'wallet-settings' },
      { icon: CreditCard, label: 'Payment History', route: 'payment-history' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'My Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'appointments':
        return <AppointmentsDashboard />
      case 'lab-tests':
        return <div className="p-6"><h1 className="text-2xl font-bold">Lab tests - Coming Soon</h1></div>;
      case 'my-ehr':
        return <MyEhrPage />;
      case 'insurance':
        return <PatientInsurancePage />;
      case 'documents':
        return <PatientDocumentsPage />;
      case 'health':
        return <HealthHistoryDashboard />;
      case 'access-requests':
        return <AccessRequestsPage />;
      case 'blockchain-history':
        return <BlockchainHistoryPage />;
      case 'wallet-settings':
        return <WalletSettingsPage />;
      case 'payment-history':
        return <PaymentHistoryPage type="patient" />;
      case 'prescriptions':
        return <PrescriptionsDashboard />;
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
