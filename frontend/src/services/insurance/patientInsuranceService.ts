import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api';
import type { PatientInsuranceDto } from '../../models/insurance/dto';
import type { CreatePatientInsurancePayload, UpdatePatientInsurancePayload } from '../../models/insurance/payload';

// Patient Insurance service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const patientInsuranceService = {
  // Get all patient insurances for authenticated patient - GET /patient-insurance
  async getAllPatientInsurances(): Promise<ApiResponse<PatientInsuranceDto[]>> {
    const response = await apiClient.get<ApiResponse<PatientInsuranceDto[]>>('/patient-insurance');
    return response.data;
  },

  // Create patient insurance - POST /patient-insurance
  async createPatientInsurance(payload: CreatePatientInsurancePayload): Promise<ApiResponse<PatientInsuranceDto>> {
    const response = await apiClient.post<ApiResponse<PatientInsuranceDto>>('/patient-insurance', payload);
    return response.data;
  },

  // Update patient insurance - PUT /patient-insurance/:patient_insurance_id
  async updatePatientInsurance(
    patientInsuranceId: number,
    payload: UpdatePatientInsurancePayload
  ): Promise<ApiResponse<PatientInsuranceDto>> {
    const response = await apiClient.put<ApiResponse<PatientInsuranceDto>>(
      `/patient-insurance/${patientInsuranceId}`,
      payload
    );
    return response.data;
  },

  // Delete patient insurance - DELETE /patient-insurance/:patient_insurance_id
  async deletePatientInsurance(patientInsuranceId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/patient-insurance/${patientInsuranceId}`);
    return response.data;
  },

  // Verify patient insurance - POST /patient-insurance/verify/:patient_insurance_id
  async verifyPatientInsurance(patientInsuranceId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`/patient-insurance/verify/${patientInsuranceId}`);
    return response.data;
  },
};
