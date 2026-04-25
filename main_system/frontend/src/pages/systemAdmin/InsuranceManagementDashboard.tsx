import React, { useMemo } from 'react';
import type { NavbarConfig } from '../../models/navbar/model';
import { useNavbarController } from '../../hooks/ui/navbar';
import { InsuranceCompaniesList } from './components/InsuranceCompaniesList';

export const InsuranceManagementDashboard: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(
    () => ({
      title: 'Insurance Management Dashboard',
      tabs: [
        { label: 'Insurance Companies', value: 'list' },
      ],
    }),
    []
  );

  const { activeTab = 'list' } = useNavbarController(navbarConfig);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {activeTab === 'list' && <InsuranceCompaniesList />}
    </div>
  );
};
