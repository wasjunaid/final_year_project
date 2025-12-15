import React from 'react';
import Table from '../../../components/Table';
import { useSystemAdminUserManagementController } from '../../../hooks/systemAdminUserManagement';
import type { SystemSubAdminModel } from '../../../models/systemAdminUserManagement';
import Alert from '../../../components/Alert';

export const SystemSubAdminsList: React.FC = () => {
  const { systemSubAdmins, loading, error, clearMessages } = useSystemAdminUserManagementController();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && systemSubAdmins.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Error Alert */}
      {error && (
        <>
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={clearMessages}
          />
          <div className="mb-2" />
        </>
      )}

      <Table
        columns={[
          {
            key: 'system_admin_id',
            header: 'ID',
            render: (user: SystemSubAdminModel) => user.system_admin_id,
          },
          {
            key: 'name',
            header: 'Name',
            render: (user: SystemSubAdminModel) => (
              <span className="font-medium">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : 'N/A'}
              </span>
            ),
          },
          {
            key: 'email',
            header: 'Email',
            render: (user: SystemSubAdminModel) => user.email,
          },
          {
            key: 'cnic',
            header: 'CNIC',
            render: (user: SystemSubAdminModel) => user.cnic || 'N/A',
          },
          {
            key: 'is_verified',
            header: 'Status',
            render: (user: SystemSubAdminModel) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_verified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {user.is_verified ? 'Verified' : 'Pending'}
              </span>
            ),
          },
          {
            key: 'created_at',
            header: 'Created',
            render: (user: SystemSubAdminModel) => formatDate(user.created_at),
          },
        ]}
        data={systemSubAdmins}
        itemsPerPage={10}
        emptyMessage="No system sub admins found"
      />
    </>
  );
};
