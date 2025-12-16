import React, { useMemo } from 'react';
import Table, { type TableColumn } from '../../components/Table';
import Alert from '../../components/Alert';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useBlockchainHistoryController } from '../../hooks/accessRequest/useBlockchainHistoryController';
import type { NavbarConfig } from '../../models/navbar/model';
import type { BlockchainHistoryRecordModel } from '../../models/accessRequest';
import { CheckCircle, XCircle, Clock, Ban } from 'lucide-react';

const BlockchainHistoryPage: React.FC = () => {
  const { history, loading, error, clearError } = useBlockchainHistoryController();

  const navbarConfig: NavbarConfig = useMemo(
    () => ({
      title: 'EHR Blockchain History',
      subtitle: 'View all EHR access requests and grants recorded on the blockchain',
    }),
    []
  );

  useNavbarController(navbarConfig);

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'GRANTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle size={14} />
            Granted
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <Clock size={14} />
            Requested
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle size={14} />
            Denied
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            <Ban size={14} />
            Revoked
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const columns: TableColumn<BlockchainHistoryRecordModel>[] = [
    {
      key: 'patientId',
      header: 'Patient ID',
      render: (row) => (
        <span className="font-mono text-sm">{row.patientId}</span>
      ),
    },
    {
      key: 'doctorId',
      header: 'Doctor ID',
      render: (row) => (
        <span className="font-mono text-sm">{row.doctorId}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (row) => {
        const date = new Date(row.timestamp);
        return (
          <div className="text-sm">
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      key: 'ipfsCID',
      header: 'IPFS CID',
      hideOnMobile: true,
      render: (row) => {
        if (!row.ipfsCID) {
          return <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>;
        }
        return (
          <div className="max-w-xs">
            <span className="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
              {row.ipfsCID}
            </span>
          </div>
        );
      },
    },
    {
      key: 'dataHash',
      header: 'Data Hash',
      hideOnMobile: true,
      render: (row) => {
        if (!row.dataHash) {
          return <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>;
        }
        return (
          <div className="max-w-xs">
            <span className="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
              {row.dataHash.substring(0, 10)}...{row.dataHash.substring(row.dataHash.length - 8)}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={clearError}
          className="mb-4"
        />
      )}

      <Table
        columns={columns}
        data={history}
        loading={loading}
        elevated={false}
        itemsPerPage={15}
        emptyMessage="No blockchain history records found"
      />
    </>
  );
};

export default BlockchainHistoryPage;
