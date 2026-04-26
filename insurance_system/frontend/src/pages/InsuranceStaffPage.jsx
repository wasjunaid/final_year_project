import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import Dropdown from '../components/ui/Dropdown';
import TablePagination from '../components/ui/TablePagination';
import { insuranceService } from '../services/insuranceService';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const InsuranceStaffPage = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    insurance_company_id: '',
    role: '',
  });
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const isInsuranceAdmin = user?.role === ROLES.INSURANCE_ADMIN;

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const response = isSuperAdmin
        ? await insuranceService.getInsuranceStaffForSuperAdmin()
        : await insuranceService.getAllInsuranceStaff();
      setStaff(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load insurance staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    if (!isSuperAdmin) return;

    try {
      setLoadingCompanies(true);
      const response = await insuranceService.getAllInsuranceCompanies();
      setCompanies(response.data || []);
    } catch {
      setCompanies([]);
      setError('Failed to load insurance companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchCompanies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [staff.length]);

  const totalPages = Math.ceil(staff.length / PAGE_SIZE);
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return staff.slice(startIndex, startIndex + PAGE_SIZE);
  }, [staff, currentPage]);

  const handleOpenDialog = () => {
    if (isSuperAdmin) {
      setFormData({ email: '', password: '', insurance_company_id: '', role: ROLES.INSURANCE_ADMIN });
    } else if (isInsuranceAdmin) {
      setFormData({ email: '', password: '', insurance_company_id: '', role: ROLES.INSURANCE_SUB_ADMIN });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ email: '', password: '', insurance_company_id: '', role: '' });
  };

  const handleSubmit = async () => {
    try {
      setError('');

      if (isSuperAdmin) {
        if (!formData.email || !formData.password || !formData.insurance_company_id || !formData.role) {
          setError('All fields are required');
          return;
        }
      } else if (isInsuranceAdmin) {
        if (!formData.email || !formData.password || !formData.role) {
          setError('Email, password, and role are required');
          return;
        }
      }

      const dataToSend = isSuperAdmin
        ? formData
        : { email: formData.email, password: formData.password, role: formData.role };

      await insuranceService.createInsuranceStaff(dataToSend);
      setSuccess('Insurance staff added successfully');
      handleCloseDialog();
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add insurance staff');
    }
  };

  const handleDelete = async (staffId) => {
    const staffMember = staff.find((entry) => entry.insurance_staff_id === staffId);
    if (staffMember && String(staffMember.user_id) === String(user?.user_id)) {
      setError('You cannot delete your own account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this insurance staff member?')) return;

    try {
      setError('');
      await insuranceService.deleteInsuranceStaff(staffId);
      setSuccess('Insurance staff deleted successfully');
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete insurance staff');
    }
  };

  const canAdd = isSuperAdmin || isInsuranceAdmin;
  const canDelete = isSuperAdmin || isInsuranceAdmin;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-68 px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Insurance Staff</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage insurance admin and sub-admin users.</p>
          </div>
          {canAdd && <Button variant="primary" onClick={handleOpenDialog}>Add Staff</Button>}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
        ) : (
          <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-[#252525]">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Staff ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">User ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">User Email</th>
                    {isSuperAdmin && <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Company</th>}
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Role</th>
                    {canDelete && <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 ? (
                    <tr><td colSpan={isSuperAdmin ? 6 : 5} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">No insurance staff found</td></tr>
                  ) : (
                    paginatedStaff.map((member) => (
                      <tr key={member.insurance_staff_id} className="border-t border-gray-100 dark:border-dark-bg-tertiary">
                        <td className="px-3 py-2">{member.insurance_staff_id}</td>
                        <td className="px-3 py-2">{member.user_id}</td>
                        <td className="px-3 py-2">{member.email}</td>
                        {isSuperAdmin && <td className="px-3 py-2">{member.insurance_company_name}</td>}
                        <td className="px-3 py-2 capitalize">{member.insurance_staff_role}</td>
                        {canDelete && (
                          <td className="px-3 py-2">
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(member.insurance_staff_id)}
                              disabled={String(member.user_id) === String(user?.user_id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={staff.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              label="staff members"
            />
          </div>
        )}
      </main>

      {openDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Add Insurance Staff
              {isSuperAdmin ? ' (Insurance Admin)' : ''}
              {isInsuranceAdmin ? ' (Insurance Sub Admin)' : ''}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <TextInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@example.com"
              />
              <TextInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />

              {isSuperAdmin && (
                <Dropdown
                  label="Insurance Company"
                  value={formData.insurance_company_id}
                  onChange={(v) => setFormData({ ...formData, insurance_company_id: v })}
                  options={companies.map((company) => ({
                    value: company.insurance_company_id,
                    label: company.name,
                  }))}
                  helperText={loadingCompanies ? 'Loading companies...' : ''}
                />
              )}

              <Dropdown
                label="Role"
                value={formData.role}
                onChange={(v) => setFormData({ ...formData, role: v })}
                options={
                  isSuperAdmin
                    ? [{ value: ROLES.INSURANCE_ADMIN, label: 'Insurance Admin' }]
                    : [{ value: ROLES.INSURANCE_SUB_ADMIN, label: 'Insurance Sub Admin' }]
                }
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit}>Add Staff</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceStaffPage;

