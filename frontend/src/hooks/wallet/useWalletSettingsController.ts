import { useState, useEffect } from 'react';
import { useWalletStore } from '../../stores/wallet';
import { paymentRepository } from '../../repositories/payment';
import type { WalletBalanceModel } from '../../models/payment';

export const useWalletSettingsController = () => {
  const { walletAddress, setWalletAddress, clearWalletAddress } = useWalletStore();
  const [balance, setBalance] = useState<WalletBalanceModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempAddress, setTempAddress] = useState(walletAddress || '');

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

  const saveWalletAddress = () => {
    if (tempAddress.trim()) {
      setWalletAddress(tempAddress.trim());
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setTempAddress(walletAddress || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTempAddress(walletAddress || '');
    setIsEditing(false);
  };

  const removeWalletAddress = () => {
    clearWalletAddress();
    setTempAddress('');
    setBalance(null);
    setIsEditing(false);
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
    isEditing,
    tempAddress,
    setTempAddress,
    saveWalletAddress,
    startEditing,
    cancelEditing,
    removeWalletAddress,
    refreshBalance,
    clearError,
  };
};
