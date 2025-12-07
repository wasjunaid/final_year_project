import React from 'react';
import Table from '../../../components/table';
import { useSystemAdminUserManagementController } from '../../../hooks/systemAdminUserManagement';
import type { HospitalAdminModel } from '../../../models/systemAdminUserManagement';
import Alert from '../../../components/Alert';

export const HospitalAdminsList: React.FC = () => {
  const { hospitalAdmins, loading, error, clearMessages } = useSystemAdminUserManagementController();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && hospitalAdmins.length === 0) {
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
            key: 'hospital_staff_id',
            header: 'ID',
            render: (user: HospitalAdminModel) => user.hospital_staff_id,
          },
          {
            key: 'name',
            header: 'Name',
            render: (user: HospitalAdminModel) => (
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
            render: (user: HospitalAdminModel) => user.email,
          },
          {
            key: 'hospital_name',
            header: 'Hospital',
            render: (user: HospitalAdminModel) => (
              <span className="font-medium">
                {user.hospital_name || 'N/A'}
              </span>
            ),
          },
          {
            key: 'cnic',
            header: 'CNIC',
            render: (user: HospitalAdminModel) => user.cnic || 'N/A',
          },
          {
            key: 'is_verified',
            header: 'Status',
            render: (user: HospitalAdminModel) => (
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
            render: (user: HospitalAdminModel) => formatDate(user.created_at),
          },
        ]}
        data={hospitalAdmins}
        itemsPerPage={10}
        emptyMessage="No hospital admins found"
      />
    </>
  );
};
