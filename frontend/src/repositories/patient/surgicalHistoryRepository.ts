import type { SurgicalHistory } from "../../models/patient/surgicalHistory/model";
import type { CreateSurgicalHistoryPayload } from "../../models/patient/surgicalHistory/payload";
import { toSurgicalHistoryModel } from "../../models/patient/surgicalHistory/transformers";
import { type ISurgicalHistoryService } from "../../services/patient/surgicalHistoryService";

export interface ISurgicalHistoryRepository {
  getSurgicalHistoryForPatient(): Promise<SurgicalHistory[]>;
  getSurgicalHistoryForDoctor(patientId: number): Promise<SurgicalHistory[]>;
  createSurgicalHistoryForDoctor(patientId: number, payload: CreateSurgicalHistoryPayload): Promise<SurgicalHistory>;
}

class CreateSurgicalHistoryRepository implements ISurgicalHistoryRepository {
  private readonly surgicalHistoryService: ISurgicalHistoryService;

  constructor(surgicalHistoryService: ISurgicalHistoryService) {
    this.surgicalHistoryService = surgicalHistoryService;
  }
  
  async getSurgicalHistoryForPatient(): Promise<SurgicalHistory[]> {
    const res = await this.surgicalHistoryService.getSurgicalHistoryForPatient();
    return res.map(item => toSurgicalHistoryModel(item));
  }

  async getSurgicalHistoryForDoctor(patientId: number): Promise<SurgicalHistory[]> {
    const res = await this.surgicalHistoryService.getSurgicalHistoryForDoctor(patientId);
    return res.map(item => toSurgicalHistoryModel(item));
  }

  async createSurgicalHistoryForDoctor(patientId: number, payload: CreateSurgicalHistoryPayload): Promise<SurgicalHistory> {
    const res = await this.surgicalHistoryService.createSurgicalHistoryForDoctor(patientId, payload);
    return toSurgicalHistoryModel(res);
  }
};

export default CreateSurgicalHistoryRepository;
