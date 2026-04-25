import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import TablePagination from '../components/ui/TablePagination';
import { personService } from '../services/personService';
import { insuranceService } from '../services/insuranceService';
import { RELATIONSHIP_TO_HOLDER } from '../constants/roles';
import { formatCNICDisplay } from '../utils/formatters';

const PersonInsurancePage = () => {
  const [personInsurances, setPersonInsurances] = useState([]);
  const [persons, setPersons] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPersons, setLoadingPersons] = useState(false);
  const [loadingInsurances, setLoadingInsurances] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ cnic: '', insurance_number: '', relationship_to_holder: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchPersonInsurances = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await personService.getAllPersonInsurances();
      setPersonInsurances(response.data || []);
    } catch (err) {
      if (err.response?.data?.status === 404) {
        setPersonInsurances([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load person insurances');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPersons = async () => {
    try {
      setLoadingPersons(true);
      const response = await personService.getAllPersons();
      setPersons(response.data || []);
    } catch {
      setPersons([]);
    } finally {
      setLoadingPersons(false);
    }
  };

  const fetchInsurances = async () => {
    try {
      setLoadingInsurances(true);
      const response = await insuranceService.getAllInsurances();
      setInsurances(response.data || []);
    } catch {
      setInsurances([]);
    } finally {
      setLoadingInsurances(false);
    }
  };

  useEffect(() => {
    fetchPersonInsurances();
    fetchPersons();
    fetchInsurances();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [personInsurances.length]);

  const totalPages = Math.ceil(personInsurances.length / PAGE_SIZE);
  const paginatedPersonInsurances = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return personInsurances.slice(startIndex, startIndex + PAGE_SIZE);
  }, [personInsurances, currentPage]);

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.cnic || !formData.insurance_number || !formData.relationship_to_holder) {
        setError('All fields are required');
        return;
      }
      await personService.createPersonInsurance(formData);
      setSuccess('Person insurance added successfully');
      setOpenDialog(false);
      setFormData({ cnic: '', insurance_number: '', relationship_to_holder: '' });
      fetchPersonInsurances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add person insurance');
    }
  };

  const handleDelete = async (personInsuranceId) => {
    if (!window.confirm('Are you sure you want to delete this person insurance?')) return;
    try {
      setError('');
      await personService.deletePersonInsurance(personInsuranceId);
      setSuccess('Person insurance deleted successfully');
      fetchPersonInsurances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete person insurance');
    }
  };

  const getPersonName = (cnic) => {
    const person = persons.find((p) => p.cnic === cnic);
    return person ? `${person.first_name} ${person.last_name}` : cnic;
  };

  const getInsuranceHolderName = (insuranceNumber) => {
    const insurance = insurances.find((i) => i.insurance_number === insuranceNumber);
    return insurance ? insurance.policy_holder_name : insuranceNumber;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-[17rem] px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-[#404040] p-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Person Insurance</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Link persons with insurance policies.</p>
          </div>
          <Button variant="primary" onClick={() => setOpenDialog(true)}><Plus size={16} /> Add Person Insurance</Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
        ) : (
          <div className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#404040] rounded-xl overflow-hidden">
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-[#252525]">
                  <tr>
                    {['Person Insurance ID', 'CNIC', 'Person Name', 'Insurance Number', 'Policy Holder', 'Relationship', 'Actions'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {personInsurances.length === 0 ? (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">No person insurances found</td></tr>
                  ) : (
                    paginatedPersonInsurances.map((personInsurance) => (
                      <tr key={personInsurance.person_insurance_id} className="border-t border-gray-100 dark:border-[#3a3a3a]">
                        <td className="px-3 py-2">{personInsurance.person_insurance_id}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{formatCNICDisplay(personInsurance.cnic)}</td>
                        <td className="px-3 py-2">{getPersonName(personInsurance.cnic)}</td>
                        <td className="px-3 py-2">{personInsurance.insurance_number}</td>
                        <td className="px-3 py-2">{getInsuranceHolderName(personInsurance.insurance_number)}</td>
                        <td className="px-3 py-2 capitalize">{personInsurance.relationship_to_holder}</td>
                        <td className="px-3 py-2">
                          <Button size="sm" variant="danger" onClick={() => handleDelete(personInsurance.person_insurance_id)}><Trash2 size={14} /></Button>
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
              totalItems={personInsurances.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              label="person-insurance links"
            />
          </div>
        )}
      </main>

      {openDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#2d2d2d] p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Person Insurance</h3>
            <div className="grid grid-cols-1 gap-3">
              <Dropdown
                label="Person (CNIC)"
                value={formData.cnic}
                onChange={(v) => setFormData({ ...formData, cnic: v })}
                options={persons.map((person) => ({
                  value: person.cnic,
                  label: `${person.first_name} ${person.last_name} - ${formatCNICDisplay(person.cnic)}`,
                }))}
                helperText={loadingPersons ? 'Loading persons...' : ''}
              />
              <Dropdown
                label="Insurance Policy"
                value={formData.insurance_number}
                onChange={(v) => setFormData({ ...formData, insurance_number: v })}
                options={insurances.map((insurance) => ({
                  value: insurance.insurance_number,
                  label: `${insurance.insurance_number} - ${insurance.policy_holder_name}`,
                }))}
                helperText={loadingInsurances ? 'Loading insurances...' : ''}
              />
              <Dropdown
                label="Relationship to Holder"
                value={formData.relationship_to_holder}
                onChange={(v) => setFormData({ ...formData, relationship_to_holder: v })}
                options={[
                  { value: RELATIONSHIP_TO_HOLDER.SELF, label: 'Self' },
                  { value: RELATIONSHIP_TO_HOLDER.SPOUSE, label: 'Spouse' },
                  { value: RELATIONSHIP_TO_HOLDER.CHILD, label: 'Child' },
                  { value: RELATIONSHIP_TO_HOLDER.PARENT, label: 'Parent' },
                ]}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={loadingPersons || loadingInsurances}>Add Person Insurance</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonInsurancePage;

