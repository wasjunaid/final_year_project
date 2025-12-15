import React, { useEffect } from 'react';
import Table, { type TableColumn } from '../../../../components/table';
import { useMedicalHistoryController } from '../../../../hooks/patient';
import type { MedicalHistory } from '../../../../models/patient/medicalHistory/model';

const MedicalHistoryView: React.FC = () => {
  const { medicalHistory, loading, error, fetchMedicalHistoryForPatient, clearMessages } = useMedicalHistoryController();

  useEffect(() => {
    fetchMedicalHistoryForPatient().catch(() => {});
  }, []);

  const columns: TableColumn<MedicalHistory>[] = [
    {
      key: 'conditionName',
      header: 'Condition',
      align: 'left',
    },
    {
      key: 'diagnosisDate',
      header: 'Diagnosis Date',
      align: 'left',
      hideOnMobile: true,
      render: (row) => row.diagnosisDate ? new Date(row.diagnosisDate).toLocaleDateString() : 'N/A',
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
          <p className="font-semibold">Error loading medical history</p>
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
        data={medicalHistory}
        loading={loading}
        emptyMessage="No medical history records found. Add your first condition using the 'Add History' tab."
        itemsPerPage={10}
      />
    </div>
  );
};

export default MedicalHistoryView;
