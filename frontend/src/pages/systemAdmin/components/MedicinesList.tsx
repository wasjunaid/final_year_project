import React from 'react';
import { Pill, RefreshCw } from 'lucide-react';
import { useMedicineController } from '../../../hooks/medicine';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import Table from '../../../components/Table';
import type { TableColumn } from '../../../components/Table';
import type { MedicineModel } from '../../../models/medicine';

export const MedicinesList: React.FC = () => {
  const { medicines, loading, error, fetchMedicines, clearError } = useMedicineController();

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
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Medicines</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} in the system
          </p>
        </div>
        <Button
          onClick={fetchMedicines}
          variant="outline"
          disabled={loading}
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4">
          <Alert message={error} type="error" onClose={clearError} />
        </div>
      )}

      {/* Table */}
      {medicines.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#2b2b2b] rounded-lg shadow p-8">
          <div className="text-center">
            <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No medicines found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add your first medicine using the "Add Medicine" tab.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#2b2b2b] rounded-lg shadow">
          <Table
            data={medicines}
            columns={columns}
            itemsPerPage={10}
          />
        </div>
      )}
    </div>
  );
};
