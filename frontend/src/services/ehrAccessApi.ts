import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  EHRAccess, 
  CreateEHRAccessRequest,
} from '../models/EHRAccess';

// Helper function to transform EHR access status to uppercase
const transformEHRAccess = (ehrAccess: any): EHRAccess => {
  // Map backend status to frontend status types
  let status = ehrAccess.status?.toUpperCase() || ehrAccess.status;
  
  // Handle status mappings
  if (status === 'REQUESTED') {
    status = 'PENDING';
  }
  // GRANTED stays as GRANTED, APPROVED stays as APPROVED
  
  return {
    ...ehrAccess,
    status: status,
  };
};

// Helper function to transform array of EHR accesses
const transformEHRAccesses = (ehrAccesses: any[]): EHRAccess[] => {
  return ehrAccesses.map(transformEHRAccess);
};

export const ehrAccessApi = {
  // PUT /ehr-access/request - Doctor requests access to patient's EHR
  requestByDoctor: async (data: CreateEHRAccessRequest): Promise<ApiResponse<EHRAccess>> => {
    const response = await api.put(EndPoints.ehrAccess.requestByDoctor, data);
    return {
      ...response.data,
      data: response.data.data ? transformEHRAccess(response.data.data) : response.data.data,
    };
  },

  // GET /ehr-access/doctor - Get all access requests for doctor
  getForDoctor: async (): Promise<ApiResponse<EHRAccess[]>> => {
    const response = await api.get(EndPoints.ehrAccess.getForDoctor);
    return {
      ...response.data,
      data: response.data.data ? transformEHRAccesses(response.data.data) : response.data.data,
    };
  },

  // GET /ehr-access/patient - Get all access requests for patient
  getForPatient: async (): Promise<ApiResponse<EHRAccess[]>> => {
    const response = await api.get(EndPoints.ehrAccess.getForPatient);
    console.log("ehrAccessApi.getForPatient response:", response);
    return {
      ...response.data,
      data: response.data.data ? transformEHRAccesses(response.data.data) : response.data.data,
    };
  },

  // PUT /ehr-access/grant/:ehr_access_id - Patient grants access
  grantByPatient: async (ehr_access_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.ehrAccess.grantByPatient.replace(':ehr_access_id', ehr_access_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /ehr-access/deny/:ehr_access_id - Patient denies access
  denyByPatient: async (ehr_access_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.ehrAccess.denyByPatient.replace(':ehr_access_id', ehr_access_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /ehr-access/revoke/:ehr_access_id - Revoke access
  revoke: async (ehr_access_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.ehrAccess.revoke.replace(':ehr_access_id', ehr_access_id.toString());
    const response = await api.put(url);
    return response.data;
  },
};