import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { PrescriptionDto, CreatePrescriptionPayload } from '../../models/prescription';

export const prescriptionService = {
  async getCurrentPrescriptionsForPatient(): Promise<ApiResponse<PrescriptionDto[]>> {
    const response = await apiClient.get<ApiResponse<PrescriptionDto[]>>('/prescription/patient/current');
    return response.data;
  },

  async getPrescriptionsForAppointment(appointmentId: number): Promise<ApiResponse<PrescriptionDto[]>> {
    const response = await apiClient.get<ApiResponse<PrescriptionDto[]>>('/prescription', {
      params: { appointment_id: appointmentId }
    });
    return response.data;
  },

  async createPrescription(payload: CreatePrescriptionPayload): Promise<ApiResponse<PrescriptionDto>> {
    const response = await apiClient.post<ApiResponse<PrescriptionDto>>('/prescription', payload);
    return response.data;
  },

  async retirePrescription(prescriptionId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>(`/prescription/${prescriptionId}`);
    return response.data;
  },
};
