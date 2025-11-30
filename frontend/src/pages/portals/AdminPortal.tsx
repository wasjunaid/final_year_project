import React from 'react';
import { 
  Users, 
  UserCog,
  Building2,
  Calendar, 
  FolderOpen, 
  BarChart3,
  Settings,
  Bell, 
  User 
} from 'lucide-react';
import BasePortal from '../../components/BasePortal';
import { useNavigationStore } from '../../stores/navigation/navigationStore';
import type { SidebarConfig } from '../../models/navigation/model';

// Import admin pages
import PatientsPage from '../patients/PatientsPage';
import DocumentsPage from '../documents/DocumentsPage';
import ReportsPage from '../reports/ReportsPage';
import NotificationsPage from '../notifications/NotificationsPage';
import ProfilePage from '../profile/ProfilePage';

const adminSidebarConfig: SidebarConfig = {
  portalName: 'Admin Portal',
  mainNavItems: [
    { icon: Users, label: 'Users Management', route: 'users' },
    { icon: UserCog, label: 'Doctors', route: 'doctors' },
    { icon: Building2, label: 'Hospitals', route: 'hospitals' },
    { icon: Calendar, label: 'Appointments', route: 'appointments' },
    { icon: FolderOpen, label: 'Documents', route: 'documents' },
    { icon: BarChart3, label: 'Analytics', route: 'analytics' },
    { icon: Settings, label: 'Settings', route: 'settings' },
  ],
  bottomNavItems: [
    { icon: Bell, label: 'Notifications', route: 'notifications' },
    { icon: User, label: 'Profile', route: 'profile' },
  ],
};

const AdminPortal: React.FC = () => {
  const { currentRoute } = useNavigationStore();

  const renderPage = () => {
    switch (currentRoute) {
      case 'users':
        return <div className="p-6"><h1 className="text-2xl font-bold">Users Management - Coming Soon</h1></div>;
      case 'doctors':
        return <div className="p-6"><h1 className="text-2xl font-bold">Doctors Management - Coming Soon</h1></div>;
      case 'hospitals':
        return <div className="p-6"><h1 className="text-2xl font-bold">Hospitals Management - Coming Soon</h1></div>;
      case 'appointments':
        return <div className="p-6"><h1 className="text-2xl font-bold">Appointments Overview - Coming Soon</h1></div>;
      case 'documents':
        return <DocumentsPage />;
      case 'analytics':
        return <ReportsPage />;
      case 'settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">System Settings - Coming Soon</h1></div>;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <PatientsPage />;
    }
  };

  return (
    <BasePortal portalType="admin" sidebarConfig={adminSidebarConfig}>
      {renderPage()}
    </BasePortal>
  );
};

export default AdminPortal;
