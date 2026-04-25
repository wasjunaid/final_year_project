import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Alert from '../components/ui/Alert';
import TablePagination from '../components/ui/TablePagination';
import { hospitalService } from '../services/hospitalService';

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data || []);
    } catch (err) {
      if (err.response?.data?.status === 404) {
        setHospitals([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load hospitals');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [hospitals.length]);

  const totalPages = Math.ceil(hospitals.length / PAGE_SIZE);
  const paginatedHospitals = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return hospitals.slice(startIndex, startIndex + PAGE_SIZE);
  }, [hospitals, currentPage]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-[17rem] px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-[#404040] p-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hospitals</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View synchronized hospitals and their contact details.</p>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
        ) : (
          <div className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#404040] rounded-xl overflow-hidden">
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-[#252525]">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Hospital ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Hospital Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Focal Person</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Phone</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Email</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">No hospitals found</td></tr>
                  ) : (
                    paginatedHospitals.map((hospital) => (
                      <tr key={hospital.hospital_id} className="border-t border-gray-100 dark:border-[#3a3a3a]">
                        <td className="px-3 py-2">{hospital.hospital_id}</td>
                        <td className="px-3 py-2 capitalize">{hospital.name}</td>
                        <td className="px-3 py-2">{hospital.focal_person_name || 'N/A'}</td>
                        <td className="px-3 py-2">{hospital.focal_person_phone || 'N/A'}</td>
                        <td className="px-3 py-2">{hospital.focal_person_email || 'N/A'}</td>
                        <td className="px-3 py-2">{hospital.address || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={hospitals.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              label="hospitals"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalsPage;
