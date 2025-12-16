import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { MedicineDto } from '../../models/medicine';

export const medicineService = {
  async getAllMedicines(): Promise<ApiResponse<MedicineDto[]>> {
    const response = await apiClient.get<ApiResponse<MedicineDto[]>>('/medicine');
    return response.data;
  },

  async createMedicine(name: string): Promise<ApiResponse<MedicineDto>> {
    const response = await apiClient.post<ApiResponse<MedicineDto>>('/medicine', { name });
    return response.data;
  },
};
