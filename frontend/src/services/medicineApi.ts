import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Medicine, 
  CreateMedicineRequest, 
  UpdateMedicineRequest,
} from '../models/Medicine';

export const medicineApi = {
  // GET /medicine
  getAll: async (): Promise<ApiResponse<Medicine[]>> => {
    const response = await api.get(EndPoints.medicine.getAll);
    return response.data;
  },

  // POST /medicine
  insert: async (data: CreateMedicineRequest): Promise<ApiResponse<Medicine>> => {
    const response = await api.post(EndPoints.medicine.insert, data);
    return response.data;
  },
};