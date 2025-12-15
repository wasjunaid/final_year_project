import type { FamilyHistory } from "../../models/patient/familyHistory/model";
import type { CreateFamilyHistoryPayload } from "../../models/patient/familyHistory/payload";
import { toFamilyHistoryModel } from "../../models/patient/familyHistory/transformers";
import { type IFamilyHistoryService } from "../../services/patient/familyHistoryService";

export interface IFamilyHistoryRepository {
  getFamilyHistoryForPatient(): Promise<FamilyHistory[]>;
  getFamilyHistoryForDoctor(patientId: number): Promise<FamilyHistory[]>;
  createFamilyHistoryForDoctor(patientId: number, payload: CreateFamilyHistoryPayload): Promise<FamilyHistory>;
}

class CreateFamilyHistoryRepository implements IFamilyHistoryRepository {
  private readonly familyHistoryService: IFamilyHistoryService;

  constructor(familyHistoryService: IFamilyHistoryService) {
    this.familyHistoryService = familyHistoryService;
  }
  
  async getFamilyHistoryForPatient(): Promise<FamilyHistory[]> {
    const res = await this.familyHistoryService.getFamilyHistoryForPatient();
    return res.map(item => toFamilyHistoryModel(item));
  }

  async getFamilyHistoryForDoctor(patientId: number): Promise<FamilyHistory[]> {
    const res = await this.familyHistoryService.getFamilyHistoryForDoctor(patientId);
    return res.map(item => toFamilyHistoryModel(item));
  }

  async createFamilyHistoryForDoctor(patientId: number, payload: CreateFamilyHistoryPayload): Promise<FamilyHistory> {
    const res = await this.familyHistoryService.createFamilyHistoryForDoctor(patientId, payload);
    return toFamilyHistoryModel(res);
  }
};

export default CreateFamilyHistoryRepository;
