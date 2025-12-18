import React from 'react';
import Table from '../../../components/Table';
import Alert from '../../../components/Alert';
import { useHospitalPanelListController } from '../../../hooks/hospitalPanelList';
import type { HospitalPanelListModel } from '../../../models/hospitalPanelList/model';
import { ActionButtons } from '../../../components/TableHelpers';

export const HospitalPanelList: React.FC = () => {
  const { hospitalPanelList, loading, error, success, clearMessages, removeFromHospitalPanel } = useHospitalPanelListController();

  const handleDelete = async (panel: HospitalPanelListModel) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${panel.insurance_company_name} from your panel list?`
    );
    if (!confirmed) return;
    
    try {
      await removeFromHospitalPanel(panel.hospital_panel_list_id);
    } catch {
      // Error handled by controller
    }
  };

  return (
    <>
      {success && (
        <>
          <Alert type="success" title="Success" message={success} onClose={clearMessages} />
          <div className="mb-4" />
        </>
      )}

      {error && (
        <>
          <Alert type="error" title="Error" message={error} onClose={clearMessages} />
          <div className="mb-4" />
        </>
      )}

      <Table
        columns={[
          {
            key: 'insurance_company_id',
            header: 'ID',
            render: (panel: HospitalPanelListModel) => panel.insurance_company_id,
          },
          {
            key: 'insurance_company_name',
            header: 'Insurance Company',
            render: (panel: HospitalPanelListModel) => (
              <span className="font-medium capitalize">{panel.insurance_company_name}</span>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (panel: HospitalPanelListModel) => (
              <ActionButtons
                buttons={[
                  {
                    label: 'Remove',
                    variant: 'danger',
                    onClick: () => handleDelete(panel),
                  },
                ]}
              />
            ),
          },
        ]}
        data={hospitalPanelList}
        loading={loading}
        itemsPerPage={10}
        emptyMessage="No insurance companies in your panel list"
      />
    </>
  );
};

export default HospitalPanelList;
