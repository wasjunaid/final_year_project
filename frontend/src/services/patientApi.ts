import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Patient, 
  UpdatePatientRequest
} from '../models/Patient';

export const patientApi = {
  // GET /patient/
  get: async (): Promise<ApiResponse<Patient>> => {
    const response = await api.get(EndPoints.patient.get);
    return response.data;
  },

  // PUT /patient/
  update: async (data: UpdatePatientRequest): Promise<ApiResponse<Patient>> => {
    const response = await api.put(EndPoints.patient.update, data);
    return response.data;
  },
};