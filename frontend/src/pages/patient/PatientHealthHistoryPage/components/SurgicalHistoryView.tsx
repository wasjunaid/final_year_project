import React, { useEffect } from 'react';
import Table, { type TableColumn } from '../../../../components/table';
import { useSurgicalHistoryController } from '../../../../hooks/patient';
import type { SurgicalHistory } from '../../../../models/patient/surgicalHistory/model';

const SurgicalHistoryView: React.FC = () => {
  const { surgicalHistory, loading, error, fetchSurgicalHistoryForPatient, clearMessages } = useSurgicalHistoryController();

  useEffect(() => {
    fetchSurgicalHistoryForPatient().catch(() => {});
  }, []);

  const columns: TableColumn<SurgicalHistory>[] = [
    {
      key: 'surgeryName',
      header: 'Surgery',
      align: 'left',
    },
    {
      key: 'surgeryDate',
      header: 'Surgery Date',
      align: 'left',
      hideOnMobile: true,
      render: (row) => row.surgeryDate ? new Date(row.surgeryDate).toLocaleDateString() : 'N/A',
    },
    {
      key: 'createdAt',
      header: 'Added On',
      align: 'left',
      hideOnMobile: true,
      hideOnTablet: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
    },
  ];

  if (error) {
    return (
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border p-6">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold">Error loading surgical history</p>
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
        data={surgicalHistory}
        loading={loading}
        emptyMessage="No surgical history recorded. Add your past surgeries using the 'Add History' tab."
        itemsPerPage={10}
      />
    </div>
  );
};

export default SurgicalHistoryView;
