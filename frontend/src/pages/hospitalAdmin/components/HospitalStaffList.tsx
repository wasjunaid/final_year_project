import React from 'react';
import Table from '../../../components/Table';
import Alert from '../../../components/Alert';
import { useHospitalStaffController } from '../../../hooks/hospitalStaff';
import type { HospitalStaffModel } from '../../../models/hospitalStaff/model';
import { StackedCell, ActionButtons } from '../../../components/TableHelpers';

export const HospitalStaffList: React.FC = () => {
  const { hospitalStaff, loading, error, success, clearMessages, deleteHospitalStaff } = useHospitalStaffController();

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

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
            key: 'person',
            header: 'Person',
            render: (s: HospitalStaffModel) => (
              <StackedCell
                primary={(s.first_name || s.last_name) ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : 'N/A'}
                secondary={s.person_email}
                tertiary={s.hospital_staff_id}
              />
            ),
          },
          { key: 'role', header: 'Role', render: (s: HospitalStaffModel) => s.role },
          { key: 'created', header: 'Created', render: (s: HospitalStaffModel) => formatDate(s.created_at) },
          {
            key: 'actions',
            header: 'Actions',
            render: (s: HospitalStaffModel) => (
              <ActionButtons
                buttons={[
                  {
                    label: 'Delete',
                    variant: 'danger',
                    onClick: async () => {
                      const confirmed = window.confirm(`Are you sure you want to delete staff ${s.person_email || s.hospital_staff_id}?`);
                      if (!confirmed) return;
                      try {
                        await deleteHospitalStaff(s.hospital_staff_id);
                      } catch (err) {
                        // error handled by controller; nothing extra needed here
                      }
                    },
                  },
                ]}
              />
            ),
          },
        ]}
        data={hospitalStaff}
        loading={loading}
        itemsPerPage={10}
        emptyMessage="No staff found"
      />
    </>
  );
};

export default HospitalStaffList;
