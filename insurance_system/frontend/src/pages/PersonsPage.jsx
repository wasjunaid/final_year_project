// src/pages/PersonsPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import PersonsTable from '../components/tables/PersonsTable';
import PersonForm from '../components/forms/PersonForm';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { personService } from '../services/personService';

const PersonsPage = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await personService.getAllPersons();
      setPersons(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load persons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleAddPerson = async (data) => {
    try {
      setFormLoading(true);
      setError('');
      await personService.createPerson(data);
      setSuccess('Person added successfully');
      setOpenForm(false);
      fetchPersons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add person');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-68 px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border p-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Persons</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage person records linked to insurance entities.</p>
          </div>
          <Button variant="primary" onClick={() => setOpenForm(true)}>
            Add Person
          </Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <PersonsTable persons={persons} />
        )}

        <PersonForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleAddPerson}
          loading={formLoading}
        />
      </main>
    </div>
  );
};

export default PersonsPage;
