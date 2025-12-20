import { useState, useEffect } from 'react';
import { useAuthController } from '../auth';
import { paymentRepository } from '../../repositories/payment';
import type { WalletBalanceModel } from '../../models/payment';
import type { PatientProfileModel } from '../../models/profile';

export const useWalletSettingsController = () => {
  const { profileData } = useAuthController();
  const patientProfile = profileData as PatientProfileModel;
  const walletAddress = patientProfile?.walletAddress || null;
  
  const [balance, setBalance] = useState<WalletBalanceModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balance when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    } else {
      setBalance(null);
    }
  }, [walletAddress]);

  const fetchBalance = async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentRepository.fetchWalletBalance(address);
      setBalance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = () => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    }
  };

  const clearError = () => setError(null);

  return {
    walletAddress,
    balance,
    loading,
    error,
    refreshBalance,
    clearError,
  };
};
