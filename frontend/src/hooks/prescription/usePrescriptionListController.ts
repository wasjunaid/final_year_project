import { useState, useEffect } from 'react';
import { prescriptionRepository } from '../../repositories/prescription';
import type { PrescriptionModel } from '../../models/prescription';

export const usePrescriptionListController = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prescriptionRepository.fetchCurrentPrescriptions();
      setPrescriptions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const retirePrescription = async (prescriptionId: number) => {
    try {
      setLoading(true);
      setError(null);
      await prescriptionRepository.retirePrescription(prescriptionId);
      // Refresh the list after retiring
      await fetchPrescriptions();
    } catch (err: any) {
      setError(err.message || 'Failed to retire prescription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    prescriptions,
    loading,
    error,
    fetchPrescriptions,
    retirePrescription,
    clearError,
  };
};
