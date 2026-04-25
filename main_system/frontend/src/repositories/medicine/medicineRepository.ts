import { medicineService } from '../../services/medicine';
import type { MedicineModel } from '../../models/medicine';
import { toMedicineModels } from '../../models/medicine';
import { AppError } from '../../utils/appError';

export const medicineRepository = {
  async fetchAllMedicines(): Promise<MedicineModel[]> {
    try {
      const resp = await medicineService.getAllMedicines();
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to fetch medicines', 
          title: 'Fetch Failed' 
        });
      }
      return toMedicineModels(resp.data || []);
    } catch (error: any) {
      if (error?.response?.status === 404) return [];
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch medicines';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },

  async createMedicine(name: string): Promise<MedicineModel> {
    try {
      const resp = await medicineService.createMedicine(name);
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to create medicine', 
          title: 'Creation Failed' 
        });
      }
      return toMedicineModels([resp.data])[0];
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create medicine';
      throw new AppError({ message: errorMessage, title: 'Creation Failed' });
    }
  },
};
