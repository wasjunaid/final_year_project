import React from 'react';
import {
  LayoutDashboard,
  User,
  Building2,
  FileText,
  Shield,
  Users,
  Building,
  BadgeCheck,
  UserPlus,
  List,
  Wallet,
  History,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: null },
    { text: 'Persons', icon: User, path: '/persons', roles: [ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN] },
    { text: 'Person Insurance', icon: UserPlus, path: '/person-insurance', roles: [ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN] },
    { text: 'Hospitals', icon: Building2, path: '/hospitals', roles: null },
    { text: 'Claims', icon: FileText, path: '/claims', roles: [ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN] },
    { text: 'Insurances', icon: Shield, path: '/insurances', roles: [ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN] },
    { text: 'Panel Hospitals', icon: List, path: '/insurance-panel', roles: [ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN] },
    { text: 'Wallet Balance', icon: Wallet, path: '/wallet-balance', roles: [ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN] },
    { text: 'Payment History', icon: History, path: '/payment-history', roles: [ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN] },
    { text: 'Insurance Companies', icon: Building, path: '/insurance-companies', roles: [ROLES.SUPER_ADMIN] },
    { text: 'Insurance Staff', icon: BadgeCheck, path: '/insurance-staff', roles: [ROLES.SUPER_ADMIN, ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN] },
    { text: 'Users', icon: Users, path: '/users', roles: [ROLES.SUPER_ADMIN] },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <aside className="fixed top-[4.5rem] left-2 z-30 w-64 h-[calc(100vh-5rem)] rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#2d2d2d] shadow-md overflow-y-auto">
      <div className="p-3">
        <div className="mb-3 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Insurance Portal
        </div>
        <div className="space-y-1.5">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.text}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white shadow'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-left">{item.text}</span>
            </button>
          );
        })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;