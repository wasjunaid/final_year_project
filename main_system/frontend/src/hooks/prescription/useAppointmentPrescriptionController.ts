import { useState } from 'react';
import { prescriptionRepository } from '../../repositories/prescription';
import type { PrescriptionModel } from '../../models/prescription';

export const useAppointmentPrescriptionController = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptionsForAppointment = async (appointmentId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await prescriptionRepository.fetchPrescriptionsForAppointment(appointmentId);
      setPrescriptions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    prescriptions,
    loading,
    error,
    fetchPrescriptionsForAppointment,
    clearError,
  };
};
