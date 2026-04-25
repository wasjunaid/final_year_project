import type { AllergyDto } from '../../models/patient/allergy/dto';
import type { CreateAllergyPayload } from '../../models/patient/allergy/payload';
import apiClient from '../apiClient';

export interface IAllergyService {
  getAllergiesForPatient(): Promise<AllergyDto[]>;
  getAllergiesForDoctor(patientId: number): Promise<AllergyDto[]>;
  createAllergyForPatient(payload: CreateAllergyPayload): Promise<AllergyDto>;
  createAllergyForDoctor(patientId: number, payload: CreateAllergyPayload): Promise<AllergyDto>;
}

class AllergyService implements IAllergyService {
  async getAllergiesForPatient(): Promise<AllergyDto[]> {
    const resp = await apiClient.get(`/patient-allergy`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload as AllergyDto[];
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as AllergyDto[];
    const maybeArray = Object.values(payload).find(v => Array.isArray(v));
    if (maybeArray) return maybeArray as AllergyDto[];
    return [] as AllergyDto[];
  }

  async getAllergiesForDoctor(patientId: number): Promise<AllergyDto[]> {
    const resp = await apiClient.get(`/patient-allergy/doctor/${patientId}`);
    const payload = resp.data;
    if (Array.isArray(payload)) return payload as AllergyDto[];
    if (Array.isArray((payload as any)?.data)) return (payload as any).data as AllergyDto[];
    const maybeArray = Object.values(payload).find(v => Array.isArray(v));
    if (maybeArray) return maybeArray as AllergyDto[];
    return [] as AllergyDto[];
  }

  async createAllergyForPatient(payload: CreateAllergyPayload): Promise<AllergyDto> {
    const resp = await apiClient.put(`/patient-allergy`, payload);
    const payloadData = resp.data;
    if ((payloadData as any)?.data) return (payloadData as any).data as AllergyDto;
    return payloadData as AllergyDto;
  }

  async createAllergyForDoctor(patientId: number, payload: CreateAllergyPayload): Promise<AllergyDto> {
    const resp = await apiClient.put(`/patient-allergy/doctor/${patientId}`, payload);
    const payloadData = resp.data;
    if ((payloadData as any)?.data) return (payloadData as any).data as AllergyDto;
    return payloadData as AllergyDto;
  }
};

export default AllergyService;
