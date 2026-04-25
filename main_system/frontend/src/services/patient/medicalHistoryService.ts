import type { MedicalHistoryDto } from '../../models/patient/medicalHistory/dto';
import type { CreateMedicalHistoryPayload } from '../../models/patient/medicalHistory/payload';
import apiClient from '../apiClient';

export interface IMedicalHistoryService {
  getMedicalHistoryForPatient(): Promise<MedicalHistoryDto[]>;
  getMedicalHistoryForDoctor(patientId: number): Promise<MedicalHistoryDto[]>;
  createMedicalHistoryForDoctor(patientId: number, payload: CreateMedicalHistoryPayload): Promise<MedicalHistoryDto>;
  createMedicalHistoryForPatient(payload: CreateMedicalHistoryPayload): Promise<MedicalHistoryDto>;
}

class MedicalHistoryService implements IMedicalHistoryService {
  async getMedicalHistoryForPatient(): Promise<MedicalHistoryDto[]> {
    const resp = await apiClient.get(`/patient-medical-history`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload as MedicalHistoryDto[];
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as MedicalHistoryDto[];
    const maybeArray = Object.values(payload).find(v => Array.isArray(v));
    if (maybeArray) return maybeArray as MedicalHistoryDto[];
    return [] as MedicalHistoryDto[];
  }

  async getMedicalHistoryForDoctor(patientId: number): Promise<MedicalHistoryDto[]> {
    const resp = await apiClient.get(`/patient-medical-history/doctor/${patientId}`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload as MedicalHistoryDto[];
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as MedicalHistoryDto[];
    const maybeArray = Object.values(payload).find(v => Array.isArray(v));
    if (maybeArray) return maybeArray as MedicalHistoryDto[];
    return [] as MedicalHistoryDto[];
  }

  async createMedicalHistoryForDoctor(patientId: number, payload: CreateMedicalHistoryPayload): Promise<MedicalHistoryDto> {
    const resp = await apiClient.put(`/patient-medical-history/doctor/${patientId}`, payload);
    const payloadData = resp.data;
    if ((payloadData as any)?.data) return (payloadData as any).data as MedicalHistoryDto;
    return payloadData as MedicalHistoryDto;
  }
  
  async createMedicalHistoryForPatient(payload: CreateMedicalHistoryPayload): Promise<MedicalHistoryDto> {
    const resp = await apiClient.put(`/patient-medical-history`, payload);
    const payloadData = resp.data;
    if ((payloadData as any)?.data) return (payloadData as any).data as MedicalHistoryDto;
    return payloadData as MedicalHistoryDto;
  }
};

export default MedicalHistoryService;
