import apiClient from '../../services/apiClient';
import type { AppointmentICDDto } from '../../models/medicalCoding/dto';

export const appointmentICDService = {
  async getAppointmentICDCodes(appointmentId: number) {
    const response = await apiClient.get(`/appointment-icd/${appointmentId}`);
    return response.data; // ApiResponse wrapper
  },
};
