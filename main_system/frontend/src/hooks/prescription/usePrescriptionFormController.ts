import { useState } from 'react';
import { prescriptionRepository } from '../../repositories/prescription';
import { medicineRepository } from '../../repositories/medicine';
import type { MedicineModel } from '../../models/medicine';
import type { PrescriptionModel, CreatePrescriptionPayload } from '../../models/prescription';

export const usePrescriptionController = () => {
  const [medicines, setMedicines] = useState<MedicineModel[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicineRepository.fetchAllMedicines();
      setMedicines(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

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

  const createPrescription = async (payload: CreatePrescriptionPayload) => {
    try {
      setLoading(true);
      setError(null);
      const newPrescription = await prescriptionRepository.createPrescription(payload);
      return newPrescription;
    } catch (err: any) {
      setError(err.message || 'Failed to create prescription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    medicines,
    prescriptions,
    loading,
    error,
    loadMedicines,
    fetchPrescriptionsForAppointment,
    createPrescription,
    clearError,
  };
};
