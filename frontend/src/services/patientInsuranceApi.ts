import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  PatientInsurance, 
  CreatePatientInsuranceRequest, 
  UpdatePatientInsuranceRequest,
} from '../models/PatientInsurance';

export const patientInsuranceApi = {
  // GET /patient-insurance
  get: async (): Promise<ApiResponse<PatientInsurance[]>> => {
    const response = await api.get(EndPoints.patientInsurance.get);
    return response.data;
  },

  // POST /patient-insurance
  insert: async (data: CreatePatientInsuranceRequest): Promise<ApiResponse<PatientInsurance>> => {
    const response = await api.post(EndPoints.patientInsurance.insert, data);
    return response.data;
  },

  // POST /patient-insurance/verify/:patient_insurance_id
  sendVerificationRequest: async (patient_insurance_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.patientInsurance.sendVerificationRequest.replace(':patient_insurance_id', patient_insurance_id.toString());
    const response = await api.post(url);
    return response.data;
  },

  // PUT /patient-insurance/:patient_insurance_id
  update: async (patient_insurance_id: number, data: UpdatePatientInsuranceRequest): Promise<ApiResponse<PatientInsurance>> => {
    const url = EndPoints.patientInsurance.update.replace(':patient_insurance_id', patient_insurance_id.toString());
    const response = await api.put(url, data);
    return response.data;
  },

  // DELETE /patient-insurance/:patient_insurance_id
  delete: async (patient_insurance_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.patientInsurance.delete.replace(':patient_insurance_id', patient_insurance_id.toString());
    const response = await api.delete(url);
    return response.data;
  },
};