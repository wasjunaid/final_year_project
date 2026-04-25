import { useState, useEffect } from 'react';
import { medicineRepository } from '../../repositories/medicine';
import type { MedicineModel } from '../../models/medicine';

export const useMedicineController = () => {
  const [medicines, setMedicines] = useState<MedicineModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicineRepository.fetchAllMedicines();
      setMedicines(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const createMedicine = async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      const newMedicine = await medicineRepository.createMedicine(name);
      setMedicines(prev => [...prev, newMedicine]);
      return newMedicine;
    } catch (err: any) {
      setError(err.message || 'Failed to create medicine');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    medicines,
    loading,
    error,
    fetchMedicines,
    createMedicine,
    clearError,
  };
};
