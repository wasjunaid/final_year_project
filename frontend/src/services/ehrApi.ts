import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { EHR } from '../models/EHR';

export const ehrApi = {
  // GET /ehr/patient/:patient_id - Get patient's EHR (for doctor with access)
  getPatientEHR: async (patient_id: number): Promise<ApiResponse<EHR>> => {
    const url = EndPoints.ehr.getPatientEHR.replace(':patient_id', patient_id.toString());
    const response = await api.get(url);
    return response.data;
  },

  // GET /ehr/patient - Get my EHR (for patient)
  getMyEHR: async (): Promise<ApiResponse<EHR>> => {
    const response = await api.get(EndPoints.ehr.getMyEHR);
    return response.data;
  },

  // PUT /ehr - Update EHR
  update: async (data: Partial<EHR>): Promise<ApiResponse<EHR>> => {
    const response = await api.put(EndPoints.ehr.update, data);
    return response.data;
  },
};