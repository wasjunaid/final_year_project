import React from 'react';
import Table, { type TableColumn } from '../../../../components/Table';
import useAssociatedStaffController from '../../../../hooks/hospital/useAssociatedStaffController';
import type { AssociatedMedicalCoderModel } from '../../../../models/associatedStaff/medicalCoder';


export const AssociatedMedicalCodersList: React.FC = () => {
  const { medicalCoders, loading, error } = useAssociatedStaffController();

  const coderColumns: TableColumn<AssociatedMedicalCoderModel>[] = [
    {
      key: 'personStack',
      header: 'Medical Coder',
      render: (row) => (
        <div className="flex flex-col">
          <div className="font-medium">{row.fullName}</div>
          <div className="text-xs text-gray-500">{row.email} • ID: {row.id}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs ${String(row.status).toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.status || 'unknown'}
        </span>
      ),
    },
  ];

  return (
    <>
      {error && <p className='text-xs text-red-500 mb-2'>{error}</p>}
      <Table columns={coderColumns} data={medicalCoders as any} itemsPerPage={10} loading={loading} />
    </>
  );
};

export default AssociatedMedicalCodersList;
