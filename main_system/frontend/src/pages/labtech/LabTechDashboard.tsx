import React, { useState, useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import type { NavbarConfig } from '../../models/navbar/model';
import PlaceholdersPage from './PlaceholdersPage';
import UploadAgainstPlaceholderPage from './UploadAgainstPlaceholderPage';

const LabTechDashboard: React.FC = () => {
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Lab Technician',
    initialActiveTab: 'placeholders',
    tabs: [
      { label: 'Placeholders', value: 'placeholders' },
    //   { label: 'Upload', value: 'upload' },
    ],
    showSearch: false,
  }), []);

  const { activeTab = 'placeholders', setActiveTab } = useNavbarController(navbarConfig);

  const [selectedPlaceholder, setSelectedPlaceholder] = useState<any | null>(null);

  return (
    <div className="flex-1 min-h-full">
      {activeTab === 'placeholders' && (
        <PlaceholdersPage onSelectPlaceholder={(p) => { setSelectedPlaceholder(p); setActiveTab('upload'); }} />
      )}

      {activeTab === 'upload' && (
        <UploadAgainstPlaceholderPage
          placeholder={selectedPlaceholder}
          onUploaded={async () => {
            // after upload, go back to placeholders and refresh list
            setSelectedPlaceholder(null);
            setActiveTab('placeholders');
          }}
          onCancel={() => {
            setSelectedPlaceholder(null);
            setActiveTab('placeholders');
          }}
        />
      )}
    </div>
  );
};

export default LabTechDashboard;
