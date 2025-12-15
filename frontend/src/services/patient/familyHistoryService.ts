import type { FamilyHistoryDto } from '../../models/patient/familyHistory/dto';
import type { CreateFamilyHistoryPayload } from '../../models/patient/familyHistory/payload';
import apiClient from '../apiClient';

export interface IFamilyHistoryService {
  getFamilyHistoryForPatient(): Promise<FamilyHistoryDto[]>;
  getFamilyHistoryForDoctor(patientId: number): Promise<FamilyHistoryDto[]>;
  createFamilyHistoryForDoctor(patientId: number, payload: CreateFamilyHistoryPayload): Promise<FamilyHistoryDto>;
}

class FamilyHistoryService implements IFamilyHistoryService {
  async getFamilyHistoryForPatient(): Promise<FamilyHistoryDto[]> {
    const resp = await apiClient.get(`/patient-family-history`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload as FamilyHistoryDto[];
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as FamilyHistoryDto[];
    const maybeArray = Object.values(payload).find(v => Array.isArray(v));
    if (maybeArray) return maybeArray as FamilyHistoryDto[];
    return [] as FamilyHistoryDto[];
  }

  async getFamilyHistoryForDoctor(patientId: number): Promise<FamilyHistoryDto[]> {
    const resp = await apiClient.get(`/patient-family-history/doctor/${patientId}`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload as FamilyHistoryDto[];
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as FamilyHistoryDto[];
    const maybeArray = Object.values(payload).find(v => Array.isArray(v));
    if (maybeArray) return maybeArray as FamilyHistoryDto[];
    return [] as FamilyHistoryDto[];
  }

  async createFamilyHistoryForDoctor(patientId: number, payload: CreateFamilyHistoryPayload): Promise<FamilyHistoryDto> {
    const resp = await apiClient.put(`/patient-family-history/doctor/${patientId}`, payload);
    const payloadData = resp.data;
    if ((payloadData as any)?.data) return (payloadData as any).data as FamilyHistoryDto;
    return payloadData as FamilyHistoryDto;
  }
};

export default FamilyHistoryService;
