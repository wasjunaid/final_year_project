import React, { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import TablePagination from '../components/ui/TablePagination';
import { userService } from '../services/userService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [superAdminPage, setSuperAdminPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setError('');
      await userService.deleteUser(userId);
      setSuccess('User deleted successfully');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const superAdmins = users.filter((u) => u.email === 'superadmin@example.com');
  const otherUsers = users.filter((u) => u.email !== 'superadmin@example.com');

  useEffect(() => {
    setSuperAdminPage(1);
  }, [superAdmins.length]);

  useEffect(() => {
    setUserPage(1);
  }, [otherUsers.length]);

  const paginatedSuperAdmins = useMemo(() => {
    const startIndex = (superAdminPage - 1) * PAGE_SIZE;
    return superAdmins.slice(startIndex, startIndex + PAGE_SIZE);
  }, [superAdmins, superAdminPage]);

  const paginatedOtherUsers = useMemo(() => {
    const startIndex = (userPage - 1) * PAGE_SIZE;
    return otherUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [otherUsers, userPage]);

  const renderTable = (rows, totalItems, currentPage, setCurrentPage, emptyText, label) => (
    <div className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#404040] rounded-xl overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#252525]">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">User ID</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Email</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Role</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">{emptyText}</td></tr>
            ) : (
              rows.map((user) => (
                <tr key={user.user_id} className="border-t border-gray-100 dark:border-[#3a3a3a]">
                  <td className="px-3 py-2">{user.user_id}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2 capitalize">{user.role || 'N/A'}</td>
                  <td className="px-3 py-2">
                    {user.email === 'superadmin@example.com' ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Protected</span>
                    ) : (
                      <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user.user_id)}><Trash2 size={14} /> Delete</Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / PAGE_SIZE)}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        label={label}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-[17rem] px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-[#404040] p-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage registered users.</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
        ) : (
          <>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Super Admins</h2>
              {renderTable(paginatedSuperAdmins, superAdmins.length, superAdminPage, setSuperAdminPage, 'No super admins found', 'super admins')}
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Users</h2>
              {renderTable(paginatedOtherUsers, otherUsers.length, userPage, setUserPage, 'No users found', 'users')}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default UsersPage;

