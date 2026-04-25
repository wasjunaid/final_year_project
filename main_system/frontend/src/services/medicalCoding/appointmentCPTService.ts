import apiClient from '../../services/apiClient';

export const appointmentCPTService = {
  async getAppointmentCPTCodes(appointmentId: number) {
    const response = await apiClient.get(`/appointment-cpt/${appointmentId}`);
    return response.data; // ApiResponse wrapper
  },
};
