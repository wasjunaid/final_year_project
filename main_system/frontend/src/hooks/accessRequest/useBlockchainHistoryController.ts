import { useState, useEffect } from 'react';
import accessRequestRepository from '../../repositories/accessRequest/accessRequestRepository';
import type { BlockchainHistoryRecordModel } from '../../models/accessRequest';

export const useBlockchainHistoryController = () => {
  const [history, setHistory] = useState<BlockchainHistoryRecordModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accessRequestRepository.fetchBlockchainHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blockchain history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearError = () => setError(null);

  return {
    history,
    loading,
    error,
    fetchHistory,
    clearError,
  };
};
