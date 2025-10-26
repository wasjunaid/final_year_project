import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  EHRAccess, 
  CreateEHRAccessRequest, 
} from '../models/EHRAccess';

export const ehrAccessApi = {
  // GET /ehr-access/patient
  getForPatient: async (): Promise<ApiResponse<EHRAccess[]>> => {
    const response = await api.get(EndPoints.ehrAccess.getForPatient);
    return response.data;
  },

  // GET /ehr-access/doctor
  getForDoctor: async (): Promise<ApiResponse<EHRAccess[]>> => {
    const response = await api.get(EndPoints.ehrAccess.getForDoctor);
    return response.data;
  },

  // POST /ehr-access/request
  requestByDoctor: async (data: CreateEHRAccessRequest): Promise<ApiResponse<EHRAccess>> => {
    const response = await api.post(EndPoints.ehrAccess.requestByDoctor, data);
    return response.data;
  },

  // PUT /ehr-access/deny/:ehr_access_request_id
  denyByPatient: async (ehr_access_request_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.ehrAccess.denyByPatient.replace(':ehr_access_request_id', ehr_access_request_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /ehr-access/grant/:ehr_access_request_id
  grantByPatient: async (ehr_access_request_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.ehrAccess.grantByPatient.replace(':ehr_access_request_id', ehr_access_request_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /ehr-access/revoke/:ehr_access_request_id
  revokeByPatient: async (ehr_access_request_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.ehrAccess.revokeByPatient.replace(':ehr_access_request_id', ehr_access_request_id.toString());
    const response = await api.put(url);
    return response.data;
  },
};