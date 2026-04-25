// src/pages/ClaimsPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ClaimsTable from '../components/tables/ClaimsTable';
import Alert from '../components/ui/Alert';
import { claimService } from '../services/claimService';
import { paymentService } from '../services/paymentService';
import { hospitalService } from '../services/hospitalService';

const CLAIM_STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [activeStatusTab, setActiveStatusTab] = useState('ALL');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [hospitals, setHospitals] = useState([]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await claimService.getAllClaims();
      setClaims(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data || []);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
      // Don't set error here as it's not critical for viewing claims
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchHospitals();
    // Load wallet address from localStorage
    const storedWalletAddress = localStorage.getItem('insuranceWalletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }
  }, []);

  const handleUpdateStatus = async (claimId, nextStatus) => {
    try {
      setError('');
      await claimService.updateClaimStatus(claimId, { status: nextStatus });
      setSuccess(`Claim ${nextStatus.toLowerCase()} successfully`);
      fetchClaims();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update claim status');
    }
  };

  const handleQuickUpdate = async (claimId, status) => {
    await handleUpdateStatus(claimId, status);
  };

  const filteredClaims = claims.filter((claim) => {
    if (activeStatusTab === 'ALL') return true;
    return String(claim.status || '').toUpperCase() === activeStatusTab;
  });

  const handleMakePayment = async (claim) => {
    if (!walletAddress) {
      setError('No wallet address configured. Please set your wallet address in the Wallet Balance page.');
      return;
    }

    // Validate claim data - check for hospital_name instead of hospital_id
    if (!claim.hospital_name || !claim.claim_amount) {
      setError('Invalid claim data. Missing hospital name or amount.');
      return;
    }

    // Check if hospitals are loaded
    if (hospitals.length === 0) {
      setError('Hospitals data is not loaded yet. Please try again.');
      return;
    }

    // Find hospital by matching name
    const hospital = hospitals.find(
      (h) => h.name && h.name.toLowerCase() === claim.hospital_name.toLowerCase()
    );

    if (!hospital || !hospital.hospital_id) {
      setError(`Hospital "${claim.hospital_name}" not found in the database. Please contact support.`);
      return;
    }

    if (window.confirm(`Are you sure you want to pay ${claim.claim_amount} ETH to ${claim.hospital_name} for claim #${claim.claim_id}?`)) {
      try {
        setPaymentLoading(true);
        setError('');
        
        const response = await paymentService.makePaymentToHospital(
          claim.claim_id_in_hospital_system,
          hospital.hospital_id, // Use the matched hospital ID
          claim.claim_amount,
          walletAddress
        );

        setSuccess(`Payment successful! Transaction Hash: ${response.data.txHash}`);
        fetchClaims(); // Refresh claims to show updated payment status
        setTimeout(() => setSuccess(''), 5000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to make payment');
      } finally {
        setPaymentLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-[17rem] px-4 pb-4 md:px-6 md:pb-6 space-y-4">
        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-[#404040] p-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Claims</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Claims are submitted from external systems. You can view and update their status here.
          </p>
        </div>

        <Alert type="info" message="Claims are submitted from external systems. You can only view and update their status here." />
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-[#404040] p-3">
          <div className="flex flex-wrap gap-2">
            {CLAIM_STATUS_TABS.map((tab) => {
              const isActive = activeStatusTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveStatusTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${isActive
                    ? 'bg-primary text-white border-primary'
                    : 'bg-transparent border-gray-300 dark:border-[#555] text-gray-700 dark:text-gray-300'}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <>
            <ClaimsTable
              claims={filteredClaims}
              onUpdateStatus={handleQuickUpdate}
              onMakePayment={handleMakePayment}
              paymentLoading={paymentLoading}
              onSelectClaim={setSelectedClaim}
              selectedClaimId={selectedClaim?.claim_id}
            />

            {selectedClaim && (
              <div className="mt-4 bg-white dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-[#404040] p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Claim Detail #{selectedClaim.claim_id}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 dark:text-gray-400">Hospital Claim ID:</span> {selectedClaim.claim_id_in_hospital_system || '-'}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Insurance Number:</span> {selectedClaim.insurance_number || '-'}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">CNIC:</span> {selectedClaim.cnic || '-'}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Hospital:</span> {selectedClaim.hospital_name || '-'}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Doctor:</span> {selectedClaim.doctor_name || '-'}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Amount:</span> {selectedClaim.claim_amount || '-'}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Appointment Date:</span> {selectedClaim.appointment_date || '-'}</div>
                  <div><span className="text-gray-500 dark:text-gray-400">Claim Date:</span> {selectedClaim.claim_date || '-'}</div>
                  <div className="md:col-span-2"><span className="text-gray-500 dark:text-gray-400">ICD Codes:</span> {selectedClaim.icd_codes || '-'}</div>
                  <div className="md:col-span-2"><span className="text-gray-500 dark:text-gray-400">CPT Codes:</span> {selectedClaim.cpt_codes || '-'}</div>
                </div>

                {String(selectedClaim.status || '').toUpperCase() === 'PENDING' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
                      onClick={() => handleQuickUpdate(selectedClaim.claim_id, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
                      onClick={() => handleQuickUpdate(selectedClaim.claim_id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ClaimsPage;
