import type { SurgicalHistoryDto } from '../../models/patient/surgicalHistory/dto';
import type { CreateSurgicalHistoryPayload } from '../../models/patient/surgicalHistory/payload';
import apiClient from '../apiClient';

export interface ISurgicalHistoryService {
  getSurgicalHistoryForPatient(): Promise<SurgicalHistoryDto[]>;
  getSurgicalHistoryForDoctor(patientId: number): Promise<SurgicalHistoryDto[]>;
  createSurgicalHistoryForDoctor(patientId: number, payload: CreateSurgicalHistoryPayload): Promise<SurgicalHistoryDto>;
}

class SurgicalHistoryService implements ISurgicalHistoryService {
  async getSurgicalHistoryForPatient(): Promise<SurgicalHistoryDto[]> {
    const resp = await apiClient.get(`/patient-surgical-history`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload as SurgicalHistoryDto[];
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as SurgicalHistoryDto[];
    const maybeArray = Object.values(payload).find(v => Array.isArray(v));
    if (maybeArray) return maybeArray as SurgicalHistoryDto[];
    return [] as SurgicalHistoryDto[];
  }

  async getSurgicalHistoryForDoctor(patientId: number): Promise<SurgicalHistoryDto[]> {
    const resp = await apiClient.get(`/patient-surgical-history/doctor/${patientId}`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload as SurgicalHistoryDto[];
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as SurgicalHistoryDto[];
    const maybeArray = Object.values(payload).find(v => Array.isArray(v));
    if (maybeArray) return maybeArray as SurgicalHistoryDto[];
    return [] as SurgicalHistoryDto[];
  }

  async createSurgicalHistoryForDoctor(patientId: number, payload: CreateSurgicalHistoryPayload): Promise<SurgicalHistoryDto> {
    const resp = await apiClient.put(`/patient-surgical-history/doctor/${patientId}`, payload);
    const payloadData = resp.data;
    if ((payloadData as any)?.data) return (payloadData as any).data as SurgicalHistoryDto;
    return payloadData as SurgicalHistoryDto;
  }
};

export default SurgicalHistoryService;
