import React, { useMemo, useState } from 'react';
import Table, { type TableColumn } from '../../components/Table';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { usePrescriptionListController } from '../../hooks/prescription/usePrescriptionListController';
import type { NavbarConfig } from '../../models/navbar/model';
import type { PrescriptionModel } from '../../models/prescription';
import { Pill, CheckCircle, RefreshCw, Calendar, Search, X } from 'lucide-react';

type DateFilter = 'all' | '7d' | '30d' | '90d';

const parseInstructionParts = (instruction?: string | null): string[] => {
  if (!instruction) return [];
  return instruction
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
};

const matchesDateFilter = (prescriptionDate?: string | null, filter: DateFilter = 'all'): boolean => {
  if (filter === 'all') return true;
  if (!prescriptionDate) return false;

  const date = new Date(prescriptionDate);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const dayDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (filter === '7d') return dayDiff <= 7;
  if (filter === '30d') return dayDiff <= 30;
  if (filter === '90d') return dayDiff <= 90;
  return true;
};

const PrescriptionsDashboard: React.FC = () => {
  const { prescriptions, loading, error, fetchPrescriptions, retirePrescription, clearError } =
    usePrescriptionListController();

  const [retiringId, setRetiringId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const navbarConfig: NavbarConfig = useMemo(
    () => ({
      title: 'My Prescriptions',
      subtitle: 'View and manage your current prescriptions',
    }),
    []
  );

  useNavbarController(navbarConfig);

  const hasActiveFilters = searchTerm.trim().length > 0 || dateFilter !== 'all';

  const filteredPrescriptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return prescriptions.filter((prescription) => {
      const matchesSearch =
        !query ||
        (prescription.medicineName || '').toLowerCase().includes(query) ||
        (prescription.dosage || '').toLowerCase().includes(query) ||
        (prescription.instruction || '').toLowerCase().includes(query);

      const matchesDate = matchesDateFilter(prescription.prescriptionDate, dateFilter);
      return matchesSearch && matchesDate;
    });
  }, [prescriptions, searchTerm, dateFilter]);

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
          <span className="font-medium text-gray-900 dark:text-white">{row.medicineName || 'Unknown Medicine'}</span>
        </div>
      ),
    },
    {
      key: 'dosage',
      header: 'Dosage',
      render: (row) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.dosage}</span>,
    },
    {
      key: 'instruction',
      header: 'Instructions',
      render: (row) => {
        const parts = parseInstructionParts(row.instruction);
        if (parts.length === 0) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
        }

        if (parts.length === 1) {
          return <span className="text-sm text-gray-700 dark:text-gray-300 break-words">{parts[0]}</span>;
        }

        return (
          <div className="space-y-1 max-w-xl">
            {parts.map((part, index) => (
              <span
                key={`${row.prescriptionId}-${index}`}
                className="block text-xs md:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/60 rounded px-2 py-1"
              >
                {part}
              </span>
            ))}
          </div>
        );
      },
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
            <span className="text-gray-700 dark:text-gray-300">{date.toLocaleDateString()}</span>
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

  // Separate current and completed prescriptions after applying filters.
  const currentPrescriptions = filteredPrescriptions.filter((p) => p.isCurrent !== false);
  const completedPrescriptions = filteredPrescriptions.filter((p) => p.isCurrent === false);

  return (
    <div className="p-6 space-y-6">
      {error && <Alert message={error} type="error" onClose={clearError} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Prescriptions</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentPrescriptions.length}</p>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedPrescriptions.length}</p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Prescriptions</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{filteredPrescriptions.length}</p>
          {hasActiveFilters && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Filtered from {prescriptions.length}</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search medicine, dosage, or instruction
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. paracetamol, 500mg, before meal"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date window</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All dates</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
              }}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg inline-flex items-center gap-1.5"
            >
              <X size={14} />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Current Prescriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Prescriptions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Medications you are currently taking</p>
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
          <Table columns={columns} data={currentPrescriptions} loading={loading} elevated={false} itemsPerPage={10} />
        ) : (
          <div className="p-12 text-center">
            <Pill className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              {hasActiveFilters ? 'No active prescriptions match your filters' : 'No active prescriptions'}
            </p>
          </div>
        )}
      </div>

      {/* Completed Prescriptions Table */}
      {completedPrescriptions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Completed Prescriptions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Previously prescribed medications</p>
          </div>

          <Table
            columns={columns.filter((col) => col.key !== 'actions')}
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
