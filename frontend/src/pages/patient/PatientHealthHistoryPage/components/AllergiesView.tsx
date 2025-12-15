import React, { useEffect } from 'react';
import Table, { type TableColumn } from '../../../../components/table';
import { useAllergyController } from '../../../../hooks/patient';
import type { Allergy } from '../../../../models/patient/allergy/model';

const AllergiesView: React.FC = () => {
  const { allergies, loading, error, fetchAllergiesForPatient, clearMessages } = useAllergyController();

  useEffect(() => {
    fetchAllergiesForPatient().catch(() => {});
  }, []);

  const columns: TableColumn<Allergy>[] = [
    {
      key: 'allergyName',
      header: 'Allergy',
      align: 'left',
    },
    {
      key: 'createdAt',
      header: 'Added On',
      align: 'left',
      hideOnMobile: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
    },
  ];

  if (error) {
    return (
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border p-6">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold">Error loading allergies</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={clearMessages}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040]">
      <Table
        columns={columns}
        data={allergies}
        loading={loading}
        emptyMessage="No allergies recorded. Add your allergies using the 'Add History' tab."
        itemsPerPage={10}
      />
    </div>
  );
};

export default AllergiesView;
