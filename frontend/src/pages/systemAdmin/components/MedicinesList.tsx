import React from 'react';
import { Pill } from 'lucide-react';
import { useMedicineController } from '../../../hooks/medicine';
import Alert from '../../../components/Alert';
import Table from '../../../components/Table';
import type { TableColumn } from '../../../components/Table';
import type { MedicineModel } from '../../../models/medicine';

export const MedicinesList: React.FC = () => {
  const { medicines, loading, error, clearError } = useMedicineController();

  const columns: TableColumn<MedicineModel>[] = [
    {
      key: 'medicineId',
      header: 'ID',
      render: (medicine: MedicineModel) => (
        <span className="font-mono text-sm">{medicine.medicineId}</span>
      ),
    },
    {
      key: 'name',
      header: 'Medicine Name',
      render: (medicine: MedicineModel) => (
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium">{medicine.name}</span>
        </div>
      ),
    },
  ];

  if (loading && medicines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Error Alert */}
      {error && (
        <div className="mb-4">
          <Alert message={error} type="error" onClose={clearError} />
        </div>
      )}

      <Table
        data={medicines}
        columns={columns}
        itemsPerPage={10}
        emptyMessage='No Medicines added yet'
      />
    </div>
  );
};
