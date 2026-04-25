import React, { useEffect } from 'react';
import Table, { type TableColumn } from '../../../../components/Table';
import { useFamilyHistoryController } from '../../../../hooks/patient';
import type { FamilyHistory } from '../../../../models/patient/familyHistory/model';

const FamilyHistoryView: React.FC = () => {
  const { familyHistory, loading, error, fetchFamilyHistoryForPatient, clearMessages } = useFamilyHistoryController();

  useEffect(() => {
    fetchFamilyHistoryForPatient().catch(() => {});
  }, []);

  const columns: TableColumn<FamilyHistory>[] = [
    {
      key: 'conditionName',
      header: 'Condition',
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
          <p className="font-semibold">Error loading family history</p>
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
        data={familyHistory}
        loading={loading}
        emptyMessage="No family history recorded. Add your family medical history using the 'Add History' tab."
        itemsPerPage={10}
      />
    </div>
  );
};

export default FamilyHistoryView;
