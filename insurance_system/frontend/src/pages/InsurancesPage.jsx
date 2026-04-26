import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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

const InsurancesPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const [insurances, setInsurances] = useState([]);
  const [loadingInsurances, setLoadingInsurances] = useState(true);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [insurancePage, setInsurancePage] = useState(1);
  const [planPage, setPlanPage] = useState(1);
  const PAGE_SIZE = 10;

  const toDateInputValue = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return String(value).slice(0, 10);
    }
    return parsed.toISOString().slice(0, 10);
  };

  const formatDateDisplay = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return String(value);
    }
    return parsed.toLocaleDateString();
  };

  const isInsuranceStaff = [ROLES.INSURANCE_ADMIN, ROLES.INSURANCE_SUB_ADMIN].includes(user?.role);

  const fetchInsurances = async () => {
    try {
      setLoadingInsurances(true);
      const response = await insuranceService.getAllInsurances();
      setInsurances(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load insurances');
    } finally {
      setLoadingInsurances(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await insuranceService.getAllInsurancePlans();
      setPlans(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load insurance plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (!isInsuranceStaff) return;
    if (tabValue === 0) fetchInsurances();
    if (tabValue === 1) fetchPlans();
  }, [tabValue, user]);

  useEffect(() => {
    setInsurancePage(1);
  }, [insurances.length]);

  useEffect(() => {
    setPlanPage(1);
  }, [plans.length]);

  const paginatedInsurances = useMemo(() => {
    const startIndex = (insurancePage - 1) * PAGE_SIZE;
    return insurances.slice(startIndex, startIndex + PAGE_SIZE);
  }, [insurances, insurancePage]);

  const paginatedPlans = useMemo(() => {
    const startIndex = (planPage - 1) * PAGE_SIZE;
    return plans.slice(startIndex, startIndex + PAGE_SIZE);
  }, [plans, planPage]);

  const handleOpenDialog = (item = null, type) => {
    if (item) {
      setEditingItem({ ...item, type });
      if (type === 'insurance') {
        setFormData({
          insurance_number: item.insurance_number,
          insurance_plan_id: item.insurance_plan_id,
          policy_holder_name: item.policy_holder_name,
          start_date: toDateInputValue(item.start_date),
          end_date: toDateInputValue(item.end_date),
          amount_remaining: item.amount_remaining ?? 0,
        });
      } else {
        setFormData({
          name: item.name,
          description: item.description,
          coverage_amount: item.coverage_amount,
          number_of_persons: item.number_of_persons,
        });
      }
    } else {
      setEditingItem({ type });
      if (type === 'insurance') {
        setFormData({
          insurance_number: '',
          insurance_plan_id: '',
          policy_holder_name: '',
          start_date: '',
          end_date: '',
          amount_remaining: 0,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          coverage_amount: 0,
          number_of_persons: 0,
        });
      }
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const type = editingItem?.type;

      if (type === 'insurance') {
        const insurancePayload = {
          ...formData,
          amount_remaining: Number(formData.amount_remaining || 0),
        };

        if (editingItem.insurance_number) {
          await insuranceService.updateInsurance(editingItem.insurance_number, insurancePayload);
          setSuccess('Insurance updated successfully');
        } else {
          await insuranceService.createInsurance(insurancePayload);
          setSuccess('Insurance created successfully');
        }
        fetchInsurances();
      }

      if (type === 'plan') {
        const payload = {
          ...formData,
          coverage_amount: Number(formData.coverage_amount || 0),
          number_of_persons: Number(formData.number_of_persons || 0),
        };
        if (editingItem.insurance_plan_id) {
          await insuranceService.updateInsurancePlan(editingItem.insurance_plan_id, payload);
          setSuccess('Plan updated successfully');
        } else {
          await insuranceService.createInsurancePlan(payload);
          setSuccess('Plan created successfully');
        }
        fetchPlans();
      }

      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      setError('');
      if (type === 'insurance') {
        await insuranceService.deleteInsurance(id);
        fetchInsurances();
      }
      if (type === 'plan') {
        await insuranceService.deleteInsurancePlan(id);
        fetchPlans();
      }
      setSuccess(`${type} deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleManualAutoRenew = async (insuranceNumber) => {
    if (!window.confirm(`Run manual auto-renew test for policy ${insuranceNumber}? This will reset policy dates and amount remaining.`)) {
      return;
    }

    try {
      setError('');
      await insuranceService.manualAutoRenewInsurance(insuranceNumber);
      setSuccess('Policy manually auto-renewed successfully (testing mode)');
      fetchInsurances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to manually auto-renew policy');
    }
  };

  const getPlanName = (planId) => {
    const plan = plans.find((p) => p.insurance_plan_id === planId);
    return plan ? plan.name : planId;
  };

  const renderInsurances = () => {
    if (loadingInsurances) {
      return <div className="flex justify-center py-10"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
    }

    return (
      <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-[#252525]">
              <tr>
                {['Insurance Number', 'Plan', 'Policy Holder', 'Start Date', 'End Date', 'Amount Remaining', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {insurances.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">No insurances found</td></tr>
              ) : (
                paginatedInsurances.map((insurance) => (
                  <tr key={insurance.insurance_number} className="border-t border-gray-100 dark:border-dark-bg-tertiary">
                    <td className="px-3 py-2">{insurance.insurance_number}</td>
                    <td className="px-3 py-2">{getPlanName(insurance.insurance_plan_id)}</td>
                    <td className="px-3 py-2">{insurance.policy_holder_name}</td>
                    <td className="px-3 py-2">{formatDateDisplay(insurance.start_date)}</td>
                    <td className="px-3 py-2">{formatDateDisplay(insurance.end_date)}</td>
                    <td className="px-3 py-2">{insurance.amount_remaining}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(insurance, 'insurance')}><Pencil size={14} /></Button>
                        <Button size="sm" variant="primary" onClick={() => handleManualAutoRenew(insurance.insurance_number)}>Auto Renew (Test)</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(insurance.insurance_number, 'insurance')}><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={insurancePage}
          totalPages={Math.ceil(insurances.length / PAGE_SIZE)}
          totalItems={insurances.length}
          pageSize={PAGE_SIZE}
          onPageChange={setInsurancePage}
          label="insurances"
        />
      </div>
    );
  };

  const renderPlans = () => {
    if (loadingPlans) {
      return <div className="flex justify-center py-10"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
    }

    return (
      <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-[#252525]">
              <tr>
                {['Plan ID', 'Plan Name', 'Description', 'Coverage Amount', 'Number of Persons', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">No plans found</td></tr>
              ) : (
                paginatedPlans.map((plan) => (
                  <tr key={plan.insurance_plan_id} className="border-t border-gray-100 dark:border-dark-bg-tertiary">
                    <td className="px-3 py-2">{plan.insurance_plan_id}</td>
                    <td className="px-3 py-2">{plan.name}</td>
                    <td className="px-3 py-2">{plan.description}</td>
                    <td className="px-3 py-2">{plan.coverage_amount}</td>
                    <td className="px-3 py-2">{plan.number_of_persons}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(plan, 'plan')}><Pencil size={14} /></Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(plan.insurance_plan_id, 'plan')}><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={planPage}
          totalPages={Math.ceil(plans.length / PAGE_SIZE)}
          totalItems={plans.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPlanPage}
          label="plans"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-68 px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Insurance Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage policies and insurance plans.</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {isInsuranceStaff && (
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-gray-200 dark:border-dark-border pb-2">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${tabValue === 0 ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'}`}
                onClick={() => setTabValue(0)}
              >
                Insurances
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${tabValue === 1 ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'}`}
                onClick={() => setTabValue(1)}
              >
                Plans
              </button>
            </div>

            {tabValue === 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insurance Policies</h2>
                  <Button variant="primary" onClick={() => handleOpenDialog(null, 'insurance')}> Add Insurance</Button>
                </div>
                {renderInsurances()}
              </>
            )}

            {tabValue === 1 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Insurance Plans</h2>
                  <Button variant="primary" onClick={() => handleOpenDialog(null, 'plan')}> Add Plan</Button>
                </div>
                {renderPlans()}
              </>
            )}
          </div>
        )}
      </main>

      {openDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {(editingItem?.insurance_number || editingItem?.insurance_plan_id) ? `Edit ${editingItem.type}` : `Add ${editingItem?.type}`}
            </h3>

            {editingItem?.type === 'insurance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextInput
                  label="Insurance Number"
                  value={formData.insurance_number || ''}
                  onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
                  disabled={!!editingItem.insurance_number}
                  className="md:col-span-2"
                />
                <Dropdown
                  label="Insurance Plan"
                  value={String(formData.insurance_plan_id || '')}
                  onChange={(v) => setFormData({ ...formData, insurance_plan_id: v })}
                  options={plans.map((plan) => ({ value: String(plan.insurance_plan_id), label: plan.name }))}
                  className="md:col-span-2"
                />
                <TextInput
                  label="Policy Holder Name"
                  value={formData.policy_holder_name || ''}
                  onChange={(e) => setFormData({ ...formData, policy_holder_name: e.target.value })}
                  className="md:col-span-2"
                />
                <TextInput
                  type="date"
                  label="Start Date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
                <TextInput
                  type="date"
                  label="End Date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
                <TextInput
                  type="number"
                  label="Amount Remaining"
                  value={formData.amount_remaining ?? 0}
                  onChange={(e) => setFormData({ ...formData, amount_remaining: e.target.value })}
                />
              </div>
            )}

            {editingItem?.type === 'plan' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextInput
                  label="Plan Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="md:col-span-2"
                />
                <TextInput
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="md:col-span-2"
                />
                <TextInput
                  type="number"
                  label="Coverage Amount"
                  value={formData.coverage_amount ?? 0}
                  onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value })}
                />
                <TextInput
                  type="number"
                  label="Number of Persons"
                  value={formData.number_of_persons ?? 0}
                  onChange={(e) => setFormData({ ...formData, number_of_persons: e.target.value })}
                />
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsurancesPage;

