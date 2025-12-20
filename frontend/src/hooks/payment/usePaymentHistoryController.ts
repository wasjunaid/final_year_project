import { useState, useEffect } from 'react';
import { useAuthController } from '../auth';
import { paymentRepository } from '../../repositories/payment';
import type { PaymentHistoryModel } from '../../models/payment';
import type { PatientProfileModel } from '../../models/profile';

interface UsePaymentHistoryControllerProps {
  type: 'patient' | 'hospital';
}

export const usePaymentHistoryController = ({ type }: UsePaymentHistoryControllerProps) => {
  const { profileData } = useAuthController();
  
  // Get wallet address from patient profile
  // Note: For hospital type, wallet address needs to come from hospital entity, not profile
  const walletAddress = type === 'patient' 
    ? (profileData as PatientProfileModel)?.walletAddress
    : null; // TODO: Implement hospital wallet fetching from hospital entity
    
  const [history, setHistory] = useState<PaymentHistoryModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!walletAddress) {
      setError('No wallet address configured');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = type === 'patient'
        ? await paymentRepository.fetchPatientPaymentHistory(walletAddress)
        : await paymentRepository.fetchHospitalPaymentHistory(walletAddress);
      
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchHistory();
    } else {
      setHistory(null);
      setError('No wallet address configured');
    }
  }, [walletAddress, type]);

  const clearError = () => setError(null);

  return {
    history,
    loading,
    error,
    walletAddress,
    fetchHistory,
    clearError,
  };
};
