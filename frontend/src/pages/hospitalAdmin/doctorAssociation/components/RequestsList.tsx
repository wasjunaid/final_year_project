import React from 'react';
import Table, { type TableColumn } from '../../../../components/table';
import { useHospitalAssociationController } from '../../../../hooks/associationRequest';
import type { HospitalAssociationRequestModel } from '../../../../models/associationRequest/hospital/model';
import { ActionButtons } from '../../../../components/TableHelpers';
import Alert from '../../../../components/Alert';



export const RequestsList: React.FC = () => {
  const { requests, loading, error, fetchRequestsForHospitalStaff, deleteHospitalStaffRequest, clearMessages } = useHospitalAssociationController();

  const remove = async (id: number) => {
    try {
      await deleteHospitalStaffRequest(id);
      await fetchRequestsForHospitalStaff();
    } catch (e) {
      // handled in hook
    }
  };

  const columns: TableColumn<HospitalAssociationRequestModel>[] = [
    {
      key: 'person',
      header: 'Person',
      render: (row) => (
        <div className="flex flex-col">
          <div className="font-medium">{row.person_name ?? `N/A`}</div>
          <div className="text-sm text-gray-500">{row.person_email ?? 'N/A'}</div>
          <div className="text-xs text-gray-400">ID: {row.person_id}</div>
        </div>
      ),
    },
    { key: 'role', header: 'Role' },
    {
      key: 'requestedAt',
      header: 'Requested At',
      render: (row) => {
        const ts = row.created_at ? new Date(row.created_at) : null;
        const dateStr = ts ? ts.toLocaleDateString() : '—';
        const timeStr = ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        return (
          <div className="flex flex-col">
            <div className=" font-medium">{dateStr}</div>
            <div className="text-sm text-gray-500">{timeStr}</div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <div>
          <ActionButtons 
          buttons={[
            {
              variant: "danger",
              label: "Cancel Request",
              onClick: () => remove(row.hospital_association_request_id),
            }
          ]} />

        </div>
      ),
    },
  ];

  return (
    <>
      {error && <Alert type="error" title="Error" message={error} onClose={clearMessages} className="mb-3" />}
      
      <Table columns={columns} data={requests} loading={loading} itemsPerPage={10} />
    </>
  );
};

export default RequestsList;
