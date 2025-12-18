import React from 'react';
import { 
  Building2,
  Users, 
  UserCog,
  Calendar, 
  TestTube,
  // FolderOpen, 
  Bell, 
  User,
  Wallet,
  CreditCard,
  Shield
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { useNotificationController } from '../../hooks/notification';
import type { SidebarConfig } from '../../models/sidebar/model';

// Import pages
import NotificationsPage from '../notifications/NotificationsPage';
import GenericProfilePage from '../profile/GenericProfilePage';
import HospitalDashboard from '../hospitalAdmin/HospitalDashboard';
import HospitalStaffManagementPage from '../hospitalAdmin/HospitalStaffManagementPage';
// import DocumentUploadDashboard from '../documents/DocumentUploadDashboard';
import HospitalAssociationPage from '../hospitalAdmin/doctorAssociation/DoctorAssociationPage';
import AppointmentsDashboard from '../appointments/AppointmentsDashboard';
import LabTestDashboard from '../hospitalAdmin/labTest/LabTestDashboard';
import WalletSettingsPage from '../wallet/WalletSettingsPage';
import PaymentHistoryPage from '../payment/PaymentHistoryPage';
import HospitalInsuranceManagementPage from '../hospitalAdmin/HospitalInsuranceManagementPage';

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
      { icon: UserCog, label: 'Association', route: 'association' },
      { icon: Shield, label: 'Insurance Panel', route: 'insurance-panel' },
      { icon: Wallet, label: 'Wallet Settings', route: 'wallet-settings' },
      { icon: CreditCard, label: 'Payment History', route: 'payment-history' },
      // { icon: FolderOpen, label: 'Documents', route: 'documents' },
    ],
    bottomNavItems: [
      { icon: Bell, label: 'Notifications', route: 'notifications', badge: unreadCount > 0 ? unreadCount : undefined },
      { icon: User, label: 'Profile', route: 'profile' },
    ],
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <HospitalDashboard />;
      case 'appointments':
        return <AppointmentsDashboard />;
      case 'lab-tests':
        return <LabTestDashboard />;
      case 'staff':
        return <HospitalStaffManagementPage />;
      case 'association':
        return <HospitalAssociationPage />;
      case 'insurance-panel':
        return <HospitalInsuranceManagementPage />;
      case 'wallet-settings':
        return <WalletSettingsPage />;
      case 'payment-history':
        return <PaymentHistoryPage type="hospital" />;
      // case 'documents':
      //   return <DocumentUploadDashboard />;
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
