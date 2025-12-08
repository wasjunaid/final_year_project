import React from 'react';
import Table, { type TableColumn } from '../../../../components/table';
import useAssociatedStaffController from '../../../../hooks/hospital/useAssociatedStaffController';
import { Badge, StackedCell } from '../../../../components/TableHelpers';
import type { AssociatedDoctorModel } from '../../../../models/associatedStaff/doctors';

export const AssociatedDoctorsList: React.FC = () => {
  const { doctors, loading, error } = useAssociatedStaffController();

  const doctorColumns: TableColumn<AssociatedDoctorModel>[] = [
    {
      key: 'personStack',
      header: 'Doctor',
      render: (row) => (
        <StackedCell
          primary={row.fullName || 'N/A'}
          secondary={row.email}
          tertiary={row.id}
        />
      ),
    },
    { 
      key: 'specialization', 
      header: 'Specialty',
      render: (row) => row.specialization || 'N/A'
    },
    { key: 'licenseNumber', header: 'License', render: (row) => row.licenseNumber || 'N/A' },
    {
      key: 'sittingHours',
      header: 'Sitting Hours',
      render: (row) =>
        row.sittingStart || row.sittingEnd
          ? `${row.sittingStart || ''} - ${row.sittingEnd || ''}`.trim()
          : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          children={row.status || 'unknown'}
          variant={String(row.status).toLowerCase() === 'active' ? 'info' : 'warning'}
        />
      ),
    },
  ];

  return (
    <>
      {error && <p className='text-xs text-red-500 mb-2'>{error}</p>}

      <Table columns={doctorColumns} data={doctors as any} itemsPerPage={10} loading={loading} />
    </>
  );
};

export default AssociatedDoctorsList;
