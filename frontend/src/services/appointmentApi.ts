import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  Appointment, 
  CreateAppointmentRequest, 
  AppointmentRescheduleRequest
} from '../models/Appointment';

export const appointmentApi = {
  // GET /appointment/patient
  getAllPatient: async (): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get(EndPoints.appointment.getAllPatient);
    return response.data;
  },

  // GET /appointment/doctor
  getAllDoctor: async (): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get(EndPoints.appointment.getAllDoctor);
    return response.data;
  },

  // GET /appointment/hospital
  getAllHospital: async (): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get(EndPoints.appointment.getAllHospital);
    return response.data;
  },

  // POST /appointment
  insert: async (data: CreateAppointmentRequest): Promise<ApiResponse<Appointment>> => {
    const response = await api.post(EndPoints.appointment.insert, data);
    return response.data;
  },

  // PUT /appointment/approve/:appointment_id
  approve: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.approve.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /appointment/deny/:appointment_id
  deny: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.deny.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /appointment/cancel/:appointment_id
  cancelByPatient: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.cancelByPatient.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /appointment/patient-reschedule/:appointment_id
  rescheduleByPatient: async (appointment_id: number, data: AppointmentRescheduleRequest): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.rescheduleByPatient.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url, data);
    return response.data;
  },

  // PUT /appointment/hospital-reschedule/:appointment_id
  rescheduleByHospital: async (appointment_id: number, data: AppointmentRescheduleRequest): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.rescheduleByHospital.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url, data);
    return response.data;
  },

  // PUT /appointment/start/:appointment_id
  startByDoctor: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.startByDoctor.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /appointment/require-lab-test/:appointment_id
  setLabTestRequiredByDoctor: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.setLabTestRequiredByDoctor.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /appointment/require-prescription/:appointment_id
  setLabPrescriptionRequiredByDoctor: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.setLabPrescriptionRequiredByDoctor.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /appointment/complete-doctor/:appointment_id
  completeByDoctor: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.completeByDoctor.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /appointment/complete-lab-test/:appointment_id
  completeLabTestByLabTechnician: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.completeLabTestByLabTechnician.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },

  // PUT /appointment/complete-prescription/:appointment_id
  completePrescriptionByLabTechnician: async (appointment_id: number): Promise<ApiResponse<null>> => {
    const url = EndPoints.appointment.completePrescriptionByLabTechnician.replace(':appointment_id', appointment_id.toString());
    const response = await api.put(url);
    return response.data;
  },
};