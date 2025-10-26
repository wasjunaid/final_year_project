import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Doctor, 
  UpdateDoctorRequest,
  UpdateDoctorStatusRequest,
  UpdateDoctorHospitalRequest
} from '../models/Doctor';

export const doctorApi = {
  // GET /doctor
  get: async (): Promise<ApiResponse<Doctor>> => {
    const response = await api.get(EndPoints.doctor.get);
    return response.data;
  },

  // GET /doctor/appointment-booking
  getDoctorsForAppointmentBooking: async (): Promise<ApiResponse<Doctor[]>> => {
    const response = await api.get(EndPoints.doctor.getDoctorsForAppointmentBooking);
    return response.data;
  },

  // PUT /doctor
  update: async (data: UpdateDoctorRequest): Promise<ApiResponse<Doctor>> => {
    const response = await api.put(EndPoints.doctor.update, data);
    return response.data;
  },

  // PUT /doctor/status/:doctor_id
  updateStatus: async (doctor_id: number, data: UpdateDoctorStatusRequest): Promise<ApiResponse<null>> => {
    const url = EndPoints.doctor.updateStatus.replace(':doctor_id', doctor_id.toString());
    const response = await api.put(url, data);
    return response.data;
  },

  // PUT /doctor/update-hospital
  updateHospitalByDoctor: async (data: UpdateDoctorHospitalRequest): Promise<ApiResponse<null>> => {
    const response = await api.put(EndPoints.doctor.updateHospitalByDoctor, data);
    return response.data;
  },

  // PUT /doctor/remove-hospital/:doctor_id
  updateHospitalByHospitalAdmin: async (doctor_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.doctor.updateHospitalByHospitalAdmin.replace(':doctor_id', doctor_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // GET /doctor/hospital
  getHospitalassociatedDoctors: async (): Promise<ApiResponse<Doctor[]>> => {
    const response = await api.get(EndPoints.doctor.getHospitalassociatedDoctors);
    return response.data;
  },
};