import React, { useMemo, useState } from 'react';
import Table, { type TableColumn } from '../../components/Table';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { usePrescriptionListController } from '../../hooks/prescription/usePrescriptionListController';
import type { NavbarConfig } from '../../models/navbar/model';
import type { PrescriptionModel } from '../../models/prescription';
import { Pill, CheckCircle, RefreshCw, Calendar } from 'lucide-react';

const PrescriptionsDashboard: React.FC = () => {
  const { prescriptions, loading, error, fetchPrescriptions, retirePrescription, clearError } = 
    usePrescriptionListController();
  
  const [retiringId, setRetiringId] = useState<number | null>(null);

  const navbarConfig: NavbarConfig = useMemo(
    () => ({
      title: 'My Prescriptions',
      subtitle: 'View and manage your current prescriptions',
    }),
    []
  );

  useNavbarController(navbarConfig);

  const handleRetire = async (prescriptionId: number) => {
    if (!confirm('Are you sure you want to mark this prescription as completed?')) {
      return;
    }

    try {
      setRetiringId(prescriptionId);
      await retirePrescription(prescriptionId);
    } catch (err) {
      // Error is already handled by the controller
    } finally {
      setRetiringId(null);
    }
  };

  const columns: TableColumn<PrescriptionModel>[] = [
    {
      key: 'medicineName',
      header: 'Medicine',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Pill size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {row.medicineName || 'Unknown Medicine'}
          </span>
        </div>
      ),
    },
    {
      key: 'dosage',
      header: 'Dosage',
      render: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.dosage}
        </span>
      ),
    },
    {
      key: 'instruction',
      header: 'Instructions',
      render: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.instruction}
        </span>
      ),
    },
    {
      key: 'prescriptionDate',
      header: 'Date',
      render: (row) => {
        if (!row.prescriptionDate) return <span className="text-gray-500 dark:text-gray-400">-</span>;
        const date = new Date(row.prescriptionDate);
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {date.toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      key: 'isCurrent',
      header: 'Status',
      render: (row) => {
        if (row.isCurrent === false) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <CheckCircle size={14} />
              Completed
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <Pill size={14} />
            Active
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        if (row.isCurrent === false) {
          return null;
        }
        
        return (
          <button
            onClick={() => handleRetire(row.prescriptionId)}
            disabled={retiringId === row.prescriptionId}
            className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            {retiringId === row.prescriptionId ? (
              <>
                <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                Complete
              </>
            )}
          </button>
        );
      },
    },
  ];

  // Separate current and completed prescriptions
  const currentPrescriptions = prescriptions.filter(p => p.isCurrent !== false);
  const completedPrescriptions = prescriptions.filter(p => p.isCurrent === false);

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert
          message={error}
          type="error"
          onClose={clearError}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Prescriptions</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {currentPrescriptions.length}
          </p>
        </div>
        
        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {completedPrescriptions.length}
          </p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Prescriptions</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {prescriptions.length}
          </p>
        </div>
      </div>

      {/* Current Prescriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Active Prescriptions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Medications you are currently taking
              </p>
            </div>
            <button
              onClick={fetchPrescriptions}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {loading && prescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading prescriptions...</p>
          </div>
        ) : currentPrescriptions.length > 0 ? (
          <Table
            columns={columns}
            data={currentPrescriptions}
            loading={loading}
            elevated={false}
            itemsPerPage={10}
          />
        ) : (
          <div className="p-12 text-center">
            <Pill className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              No active prescriptions
            </p>
          </div>
        )}
      </div>

      {/* Completed Prescriptions Table */}
      {completedPrescriptions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Completed Prescriptions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Previously prescribed medications
            </p>
          </div>

          <Table
            columns={columns.filter(col => col.key !== 'actions')}
            data={completedPrescriptions}
            loading={loading}
            elevated={false}
            itemsPerPage={10}
          />
        </div>
      )}
    </div>
  );
};

export default PrescriptionsDashboard;
