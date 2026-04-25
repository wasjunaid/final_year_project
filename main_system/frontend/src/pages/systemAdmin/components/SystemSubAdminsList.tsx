import React, { useEffect, useState } from 'react';
import Table from '../../../components/Table';
import { useSystemAdminUserManagementController } from '../../../hooks/systemAdminUserManagement';
import type { SystemSubAdminModel } from '../../../models/systemAdminUserManagement';
import Alert from '../../../components/Alert';
import TextInput from '../../../components/TextInput';
import Dropdown from '../../../components/Dropdown';
import type { UserListFiltersPayload } from '../../../models/systemAdminUserManagement/payload';
import { ROLES } from '../../../constants/profile';

export const SystemSubAdminsList: React.FC = () => {
  const { systemSubAdmins, loading, error, clearMessages, updateSystemSubAdminStatus, fetchSystemSubAdmins } = useSystemAdminUserManagementController();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'deactivated'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const buildQueryFilters = (): UserListFiltersPayload => {
    const filters: UserListFiltersPayload = {};

    if (searchTerm.trim().length > 0) {
      filters.search = searchTerm.trim();
    }

    if (activeFilter === 'active') {
      filters.is_active = true;
    } else if (activeFilter === 'deactivated') {
      filters.is_active = false;
    }

    if (verificationFilter === 'verified') {
      filters.is_verified = true;
    } else if (verificationFilter === 'pending') {
      filters.is_verified = false;
    }

    return filters;
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchSystemSubAdmins(buildQueryFilters());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm, activeFilter, verificationFilter]);

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

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <TextInput
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by id, name, email, CNIC"
        />
        <Dropdown
          label="Account State"
          value={activeFilter}
          onChange={(value) => setActiveFilter(value as 'all' | 'active' | 'deactivated')}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'deactivated', label: 'Deactivated' },
          ]}
        />
        <Dropdown
          label="Verification"
          value={verificationFilter}
          onChange={(value) => setVerificationFilter(value as 'all' | 'verified' | 'pending')}
          options={[
            { value: 'all', label: 'All' },
            { value: 'verified', label: 'Verified' },
            { value: 'pending', label: 'Pending' },
          ]}
        />
      </div>

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            setActiveFilter('all');
            setVerificationFilter('all');
          }}
          className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Reset Filters
        </button>
      </div>

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
              <div className="flex gap-2 items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_verified
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}
                >
                  {user.is_verified ? 'Verified' : 'Pending'}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_deleted
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {user.is_deleted ? 'Deactivated' : 'Active'}
                </span>
              </div>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (user: SystemSubAdminModel) => {
              if (user.role === ROLES.SYSTEM_ADMIN) {
                return (
                  <span className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    Protected
                  </span>
                );
              }

              return (
                <button
                  onClick={async () => {
                    const nextActiveState = Boolean(user.is_deleted);
                    if (!confirm(`Are you sure you want to ${nextActiveState ? 'activate' : 'deactivate'} this system sub admin?`)) return;
                    await updateSystemSubAdminStatus(user.system_admin_id, nextActiveState, buildQueryFilters());
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    user.is_deleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {user.is_deleted ? 'Activate' : 'Deactivate'}
                </button>
              );
            },
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
