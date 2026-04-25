import apiClient from '../../services/apiClient';

export const appointmentICDService = {
  async getAppointmentICDCodes(appointmentId: number) {
    const response = await apiClient.get(`/appointment-icd/${appointmentId}`);
    return response.data; // ApiResponse wrapper
  },
};
