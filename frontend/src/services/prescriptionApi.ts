import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Prescription, 
  CreatePrescriptionRequest, 
} from '../models/Prescription';

export const prescriptionApi = {
  // POST /prescription
  insert: async (data: CreatePrescriptionRequest): Promise<ApiResponse<Prescription>> => {
    const response = await api.post(EndPoints.prescription.insert, data);
    return response.data;
  },

  // GET /prescription
  getAgainstAppointment: async (appointment_id?: number): Promise<ApiResponse<Prescription[]>> => {
    const params = appointment_id ? { appointment_id } : {};
    const response = await api.get(EndPoints.prescription.getAgainstAppointment, { params });
    return response.data;
  },
};