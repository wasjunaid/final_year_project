import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { AppointmentDto } from '../../models/appointment/dto';
import type { 
  CreateAppointmentPayload, 
  PatientRescheduleAppointmentPayload, 
  HospitalRescheduleAppointmentPayload, 
  CompleteDoctorPayload
} from '../../models/appointment/payload';

const appointmentService = {
  async getForPatient(): Promise<ApiResponse<AppointmentDto[]>> {
    const resp = await apiClient.get<ApiResponse<AppointmentDto[]>>('/appointment/patient');
    console.log("Response of getforpateint: ", resp);
    return resp.data;
  },

  async getForDoctor(): Promise<ApiResponse<AppointmentDto[]>> {
    const resp = await apiClient.get<ApiResponse<AppointmentDto[]>>('/appointment/doctor');
    return resp.data;
  },

  async getForHospital(): Promise<ApiResponse<AppointmentDto[]>> {
    const resp = await apiClient.get<ApiResponse<AppointmentDto[]>>('/appointment/hospital');
    return resp.data;
  },

  async create(payload: CreateAppointmentPayload): Promise<ApiResponse<AppointmentDto>> {
    const resp = await apiClient.post<ApiResponse<AppointmentDto>>('/appointment', payload);
    return resp.data;
  },

  async approve(appointmentId: number, payload: any): Promise<ApiResponse<any>> {
    const resp = await apiClient.put<ApiResponse<any>>(`/appointment/approve/${appointmentId}`, payload);
    return resp.data;
  },

  async deny(appointmentId: number): Promise<ApiResponse<any>> {
    const resp = await apiClient.put<ApiResponse<any>>(`/appointment/deny/${appointmentId}`);
    return resp.data;
  },

  async cancel(appointmentId: number): Promise<ApiResponse<any>> {
    const resp = await apiClient.put<ApiResponse<any>>(`/appointment/cancel/${appointmentId}`);
    return resp.data;
  },

  async rescheduleForPatient(appointmentId: number, payload: PatientRescheduleAppointmentPayload): Promise<ApiResponse<any>> {
    console.log("apppointmetn rescheduled for patient ", payload);
    const resp = await apiClient.put<ApiResponse<any>>(`/appointment/patient-reschedule/${appointmentId}`, payload);
    return resp.data;
  },
  
  async rescheduleForHospital(appointmentId: number, payload: HospitalRescheduleAppointmentPayload): Promise<ApiResponse<any>> {
    console.log("apppointmetn rescheduled for hospital ", payload);
    const resp = await apiClient.put<ApiResponse<any>>(`/appointment/hospital-reschedule/${appointmentId}`, payload);
    return resp.data;
  },

  async startStart(appointmentId: number): Promise<ApiResponse<any>> {
    const resp = await apiClient.put<ApiResponse<any>>(`/appointment/start/${appointmentId}`);
    return resp.data;
  },

  // async requireLabTest(appointmentId: number): Promise<ApiResponse<any>> {
  //   const resp = await apiClient.put<ApiResponse<any>>(`/appointment/require-lab-test/${appointmentId}`);
  //   return resp.data;
  // },

  // async requirePrescription(appointmentId: number): Promise<ApiResponse<any>> {
  //   const resp = await apiClient.put<ApiResponse<any>>(`/appointment/require-prescription/${appointmentId}`);
  //   return resp.data;
  // },

  async completeDoctor(appointmentId: number, payload: CompleteDoctorPayload): Promise<ApiResponse<any>> {
    const resp = await apiClient.put(`/appointment/complete-doctor/${appointmentId}`, payload);
    const body = resp.data;
    // Normalize responses: some endpoints return the ApiResponse wrapper { success, data },
    // while others may return the resource directly. Convert raw resource into expected wrapper.
    if (body && typeof body.success === 'undefined') {
      return { success: true, data: body } as ApiResponse<any>;
    }
    return body as ApiResponse<any>;
  },

  // async completeLabTest(appointmentId: number): Promise<ApiResponse<any>> {
  //   const resp = await apiClient.put<ApiResponse<any>>(`/appointment/complete-lab-test/${appointmentId}`);
  //   return resp.data;
  // },

  // async completePrescription(appointmentId: number): Promise<ApiResponse<any>> {
  //   const resp = await apiClient.put<ApiResponse<any>>(`/appointment/complete-prescription/${appointmentId}`);
  //   return resp.data;
  // },
};

export default appointmentService;