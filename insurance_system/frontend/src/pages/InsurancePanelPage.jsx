import React, { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import TablePagination from '../components/ui/TablePagination';
import { insuranceService } from '../services/insuranceService';
import { hospitalService } from '../services/hospitalService';

const InsurancePanelPage = () => {
  const [panelList, setPanelList] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ hospital_id: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchPanelList = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await insuranceService.getInsurancePanelList();
      setPanelList(response.data || []);
    } catch (err) {
      if (err.response?.data?.status === 404) {
        setPanelList([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load insurance panel list');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data || []);
    } catch {
      setHospitals([]);
    } finally {
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    fetchPanelList();
    fetchHospitals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [panelList.length]);

  const totalPages = Math.ceil(panelList.length / PAGE_SIZE);
  const paginatedPanelList = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return panelList.slice(startIndex, startIndex + PAGE_SIZE);
  }, [panelList, currentPage]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ hospital_id: '' });
  };

  const handleSubmit = async () => {
    try {
      setError('');

      if (!formData.hospital_id) {
        setError('Hospital is required');
        return;
      }

      await insuranceService.createInsurancePanelList(formData);
      setSuccess('Hospital added to panel list successfully');
      handleCloseDialog();
      fetchPanelList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add hospital to panel list');
    }
  };

  const handleDelete = async (panelListId) => {
    if (!window.confirm('Are you sure you want to remove this hospital from the panel list?')) return;

    try {
      setError('');
      await insuranceService.deleteInsurancePanelList(panelListId);
      setSuccess('Hospital removed from panel list successfully');
      fetchPanelList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove hospital from panel list');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-68 px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Insurance Panel Hospitals</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage hospitals in your insurance panel network.</p>
          </div>
          <Button variant="primary" onClick={() => setOpenDialog(true)}>Add Hospital</Button>
        </div>

        <Alert type="info" message="Manage the list of hospitals that are part of your insurance company's panel network." />
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
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Panel List ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Hospital ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Hospital Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Focal Person</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Phone</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Email</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Address</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {panelList.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">No hospitals in panel list</td></tr>
                  ) : (
                    paginatedPanelList.map((panel) => (
                      <tr key={panel.insurance_panel_list_id} className="border-t border-gray-100 dark:border-dark-bg-tertiary">
                        <td className="px-3 py-2">{panel.insurance_panel_list_id}</td>
                        <td className="px-3 py-2">{panel.hospital_id}</td>
                        <td className="px-3 py-2">{panel.hospital_name}</td>
                        <td className="px-3 py-2">{panel.focal_person_name || 'N/A'}</td>
                        <td className="px-3 py-2">{panel.focal_person_phone || 'N/A'}</td>
                        <td className="px-3 py-2">{panel.focal_person_email || 'N/A'}</td>
                        <td className="px-3 py-2">{panel.address || 'N/A'}</td>
                        <td className="px-3 py-2">
                          <Button size="sm" variant="danger" onClick={() => handleDelete(panel.insurance_panel_list_id)}><Trash2 size={14} /></Button>
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
              totalItems={panelList.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              label="panel hospitals"
            />
          </div>
        )}
      </main>

      {openDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Hospital to Panel</h3>
            <Dropdown
              label="Hospital"
              value={formData.hospital_id}
              onChange={(v) => setFormData({ hospital_id: v })}
              options={hospitals.map((hospital) => ({
                value: hospital.hospital_id,
                label: hospital.name || hospital.hospital_name,
              }))}
              helperText={loadingHospitals ? 'Loading hospitals...' : ''}
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={loadingHospitals}>Add Hospital</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsurancePanelPage;
