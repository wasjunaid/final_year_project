import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import TablePagination from '../components/ui/TablePagination';
import { insuranceService } from '../services/insuranceService';

const InsuranceCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    wallet_address: '',
    focal_person_name: '',
    focal_person_phone: '',
    focal_person_email: '',
    address: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await insuranceService.getAllInsuranceCompanies();
      setCompanies(response.data || []);
    } catch (err) {
      if (err.response?.data?.status === 404) {
        setCompanies([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load insurance companies');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [companies.length]);

  const totalPages = Math.ceil(companies.length / PAGE_SIZE);
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return companies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [companies, currentPage]);

  const handleOpenDialog = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name || '',
        wallet_address: company.wallet_address || '',
        focal_person_name: company.focal_person_name || '',
        focal_person_phone: company.focal_person_phone || '',
        focal_person_email: company.focal_person_email || '',
        address: company.address || '',
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        wallet_address: '',
        focal_person_name: '',
        focal_person_phone: '',
        focal_person_email: '',
        address: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      wallet_address: '',
      focal_person_name: '',
      focal_person_phone: '',
      focal_person_email: '',
      address: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.name?.trim()) {
        setError('Company name is required');
        return;
      }

      if (editingCompany) {
        await insuranceService.updateInsuranceCompany(editingCompany.insurance_company_id, formData);
        setSuccess('Insurance company updated successfully');
      } else {
        await insuranceService.createInsuranceCompany(formData);
        setSuccess('Insurance company created successfully');
      }

      handleCloseDialog();
      fetchCompanies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save insurance company');
    }
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this insurance company?')) return;

    try {
      setError('');
      await insuranceService.deleteInsuranceCompany(companyId);
      setSuccess('Insurance company deleted successfully');
      fetchCompanies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete insurance company');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-68 px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Insurance Companies</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage insurance company records.</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenDialog()}>Add Company</Button>
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
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Company ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Company Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Wallet Address</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Focal Person</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Phone</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Email</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Address</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">No insurance companies found</td></tr>
                  ) : (
                    paginatedCompanies.map((company) => (
                      <tr key={company.insurance_company_id} className="border-t border-gray-100 dark:border-dark-bg-tertiary">
                        <td className="px-3 py-2">{company.insurance_company_id}</td>
                        <td className="px-3 py-2 capitalize">{company.name}</td>
                        <td className="px-3 py-2 font-mono text-xs">{company.wallet_address || 'N/A'}</td>
                        <td className="px-3 py-2">{company.focal_person_name || 'N/A'}</td>
                        <td className="px-3 py-2">{company.focal_person_phone || 'N/A'}</td>
                        <td className="px-3 py-2">{company.focal_person_email || 'N/A'}</td>
                        <td className="px-3 py-2">{company.address || 'N/A'}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenDialog(company)}><Pencil size={14} /></Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(company.insurance_company_id)}><Trash2 size={14} /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={companies.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              label="companies"
            />
          </div>
        )}
      </main>

      {openDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{editingCompany ? 'Edit Insurance Company' : 'Add Insurance Company'}</h3>
            <div className="space-y-3">
              <TextInput
                label="Company Name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
              <TextInput
                label="Wallet Address"
                value={formData.wallet_address}
                onChange={(e) => setFormData((prev) => ({ ...prev, wallet_address: e.target.value }))}
                placeholder="0x..."
              />
              <TextInput
                label="Focal Person"
                value={formData.focal_person_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, focal_person_name: e.target.value }))}
              />
              <TextInput
                label="Focal Person Phone"
                value={formData.focal_person_phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, focal_person_phone: e.target.value }))}
              />
              <TextInput
                label="Focal Person Email"
                value={formData.focal_person_email}
                onChange={(e) => setFormData((prev) => ({ ...prev, focal_person_email: e.target.value }))}
              />
              <TextInput
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit}>{editingCompany ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceCompaniesPage;
