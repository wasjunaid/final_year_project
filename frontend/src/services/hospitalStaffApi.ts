import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  HospitalStaff, 
  CreateHospitalStaffRequest, 
} from '../models/HospitalStaff';

export const hospitalStaffApi = {
  // GET /hospital-staff/admin
  getAdminsForSuperAdmin: async (): Promise<ApiResponse<HospitalStaff[]>> => {
    const response = await api.get(EndPoints.hospitalStaff.getAdminsForSuperAdmin);
    return response.data;
  },

  // POST /hospital-staff
  insert: async (data: CreateHospitalStaffRequest): Promise<ApiResponse<HospitalStaff>> => {
    const response = await api.post(EndPoints.hospitalStaff.insert, data);
    return response.data;
  },

  // DELETE /hospital-staff/:hospital_staff_id
  delete: async (hospital_staff_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.hospitalStaff.delete.replace(':hospital_staff_id', hospital_staff_id.toString());
    const response = await api.delete(url);
    return response.data;
  },

  // GET /hospital-staff
  get: async (): Promise<ApiResponse<HospitalStaff[]>> => {
    const response = await api.get(EndPoints.hospitalStaff.get);
    return response.data;
  },

  // GET /hospital-staff/all
  getAll: async (): Promise<ApiResponse<HospitalStaff[]>> => {
    const response = await api.get(EndPoints.hospitalStaff.getAll);
    return response.data;
  },
};