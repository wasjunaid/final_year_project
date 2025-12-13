import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import type { NavbarConfig } from '../../models/navbar/model';
import { useNavbarController } from '../../hooks/ui/navbar';
import Table from '../../components/table';
import { useLogController } from '../../hooks/log';
import type { LogModel } from '../../models/log';
import Alert from '../../components/Alert';
import { LogFiltersComponent } from './components/LogFiltersComponent';

export const LogsManagementDashboard: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Logs & Audit Trail',
    tabs: [],
    actions: [
      {
        label: showFilters ? 'Hide Filters' : 'Show Filters',
        icon: Filter,
        onClick: () => setShowFilters(!showFilters),
        variant: showFilters ? 'secondary' : 'ghost',
      },
    ],
  }), [showFilters]);

  useNavbarController(navbarConfig);

  const {
    logs,
    allLogs,
    uniqueUsers,
    loading,
    error,
    filters,
    fetchLogs,
    updateFilters,
    resetFilters,
    clearError,
  } = useLogController();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading && allLogs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* Error Alert */}
      {error && (
        <>
          <Alert type="error" title="Error" message={error} onClose={clearError} />
          <div className="mb-4" />
        </>
      )}

      {/* Filters - Conditionally Rendered */}
      {showFilters && (
        <LogFiltersComponent
          filters={filters}
          uniqueUsers={uniqueUsers}
          onUpdateFilters={updateFilters}
          onResetFilters={resetFilters}
          onRefresh={fetchLogs}
          isLoading={loading}
        />
      )}

      

      {/* Logs Table */}
      <Table
        columns={[
          {
            key: 'log_id',
            header: 'ID',
            render: (log: LogModel) => log.log_id,
          },
          {
            key: 'user_name',
            header: 'User',
            render: (log: LogModel) => (
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{log.user_name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{log.email}</div>
              </div>
            ),
          },
          {
            key: 'action',
            header: 'Action',
            render: (log: LogModel) => (
              <span className="text-sm text-gray-900 dark:text-white">{log.action}</span>
            ),
          },
          {
            key: 'created_at',
            header: 'Timestamp',
            render: (log: LogModel) => (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(log.created_at)}
              </span>
            ),
          },
        ]}
        data={logs}
        itemsPerPage={10}
        emptyMessage="No logs found matching the current filters"
      />
    </div>
  );
};
