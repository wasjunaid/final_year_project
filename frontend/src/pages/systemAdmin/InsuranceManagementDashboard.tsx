import React, { useState, useMemo } from 'react';
import type { NavbarConfig } from '../../models/navbar/model';
import { useNavbarController } from '../../hooks/ui/navbar';
import { InsuranceCompaniesList } from './components/InsuranceCompaniesList';
import { CreateOrEditInsurance } from './components/CreateOrEditInsurance';
import type { InsuranceCompanyModel } from '../../models/insurance';

export const InsuranceManagementDashboard: React.FC = () => {
  const [editingCompany, setEditingCompany] = useState<InsuranceCompanyModel | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const navbarConfig: NavbarConfig = useMemo(
    () => ({
      title: 'Insurance Management Dashboard',
      tabs: [
        { label: 'Insurance Companies', value: 'list' },
        // { label: 'Create Company', value: 'create' },
      ],
    }),
    []
  );

  const { activeTab = 'list' } = useNavbarController(navbarConfig);

  // Determine which tab to show based on update mode
  const currentTab = isUpdateMode ? 'update' : activeTab;

  const handleEdit = (company: InsuranceCompanyModel) => {
    setEditingCompany(company);
    setIsUpdateMode(true);
  };

  const handleSuccess = () => {
    // Don't automatically switch tabs on success - let user stay on form
  };

  const handleCancelEdit = () => {
    setEditingCompany(null);
    setIsUpdateMode(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* Insurance Companies List Tab */}
      {currentTab === 'list' && <InsuranceCompaniesList onEdit={handleEdit} />}

      {/* Create Insurance Tab */}
      {currentTab === 'create' && (
        <CreateOrEditInsurance
          onSuccess={handleSuccess}
        />
      )}

      {/* Update Insurance Tab (hidden from navbar) */}
      {currentTab === 'update' && (
        <CreateOrEditInsurance
          editingCompany={editingCompany}
          onSuccess={handleSuccess}
          onCancelEdit={handleCancelEdit}
        />
      )}
    </div>
  );
};
