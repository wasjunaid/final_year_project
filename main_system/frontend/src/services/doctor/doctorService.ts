import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { AssociatedDoctorDto } from '../../models/associatedStaff/doctors/dto';

const doctorService = {
  async getDoctorsForAppointmentBooking(): Promise<ApiResponse<AssociatedDoctorDto[]>> {
    const resp = await apiClient.get<ApiResponse<AssociatedDoctorDto[]>>('/doctor/appointment-booking');
    return resp.data;
  },
};

export default doctorService;
