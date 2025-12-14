import type { LabTestDto } from '../../models/labTest/dto';
import type { CreateLabTestPayload, UpdateLabTestPayload } from '../../models/labTest/payload';
import apiClient from '../apiClient';

export interface ILabTestService {
  getAllLabTestsIfExists(): Promise<LabTestDto[]>;
  createLabTest(payload: CreateLabTestPayload): Promise<LabTestDto>;
  updateLabTest(labTestId: number, payload: UpdateLabTestPayload): Promise<LabTestDto>;
}

class LabTestService implements ILabTestService {
  async getAllLabTestsIfExists(): Promise<LabTestDto[]> {
    const resp = await apiClient.get(`/lab-test`);
      const payload = resp.data;
      if (Array.isArray(payload)) return payload as LabTestDto[];
      if (Array.isArray((payload as any)?.data)) return (payload as any).data as LabTestDto[];
      // Fallback: if backend returned an object with items under other keys, try to find an array
      const maybeArray = Object.values(payload).find(v => Array.isArray(v));
      if (maybeArray) return maybeArray as LabTestDto[];
      // As last resort, return empty array
      return [] as LabTestDto[];
  }

  async createLabTest(payload: CreateLabTestPayload): Promise<LabTestDto> {
    const resp = await apiClient.post(`/lab-test`, payload);
      const payloadData = resp.data;
      if ((payloadData as any)?.data) return (payloadData as any).data as LabTestDto;
      return payloadData as LabTestDto;
  }

  async updateLabTest(labTestId: number, payload: UpdateLabTestPayload): Promise<LabTestDto> {
    const resp = await apiClient.put(`/lab-test/${labTestId}`, payload);
      const payloadData = resp.data;
      if ((payloadData as any)?.data) return (payloadData as any).data as LabTestDto;
      return payloadData as LabTestDto;
  }
};

export default LabTestService;