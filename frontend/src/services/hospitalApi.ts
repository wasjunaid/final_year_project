import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Hospital, 
  CreateHospitalRequest, 
  UpdateHospitalRequest
} from '../models/Hospital';

export const hospitalApi = {
  // GET /hospital
  get: async (): Promise<ApiResponse<Hospital[]>> => {
    const response = await api.get(EndPoints.hospital.get);
    return response.data;
  },

  // POST /hospital
  insert: async (data: CreateHospitalRequest): Promise<ApiResponse<Hospital>> => {
    const response = await api.post(EndPoints.hospital.insert, data);
    return response.data;
  },

  // PUT /hospital/:hospital_id
  update: async (hospital_id: number, data: UpdateHospitalRequest): Promise<ApiResponse<Hospital>> => {
    const url = EndPoints.hospital.update.replace(':hospital_id', hospital_id.toString());
    const response = await api.put(url, data);
    return response.data;
  },
};