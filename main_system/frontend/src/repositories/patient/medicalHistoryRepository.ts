import type { MedicalHistory } from "../../models/patient/medicalHistory/model";
import type { CreateMedicalHistoryPayload } from "../../models/patient/medicalHistory/payload";
import { toMedicalHistoryModel } from "../../models/patient/medicalHistory/transformers";
import { type IMedicalHistoryService } from "../../services/patient/medicalHistoryService";

export interface IMedicalHistoryRepository {
  getMedicalHistoryForPatient(): Promise<MedicalHistory[]>;
  getMedicalHistoryForDoctor(patientId: number): Promise<MedicalHistory[]>;
  createMedicalHistoryForDoctor(patientId: number, payload: CreateMedicalHistoryPayload): Promise<MedicalHistory>;
  createMedicalHistoryForPatient(payload: CreateMedicalHistoryPayload): Promise<MedicalHistory>;
}

class CreateMedicalHistoryRepository implements IMedicalHistoryRepository {
  private readonly medicalHistoryService: IMedicalHistoryService;

  constructor(medicalHistoryService: IMedicalHistoryService) {
    this.medicalHistoryService = medicalHistoryService;
  }
  
  async getMedicalHistoryForPatient(): Promise<MedicalHistory[]> {
    const res = await this.medicalHistoryService.getMedicalHistoryForPatient();
    return res.map(item => toMedicalHistoryModel(item));
  }

  async getMedicalHistoryForDoctor(patientId: number): Promise<MedicalHistory[]> {
    const res = await this.medicalHistoryService.getMedicalHistoryForDoctor(patientId);
    return res.map(item => toMedicalHistoryModel(item));
  }

  async createMedicalHistoryForDoctor(patientId: number, payload: CreateMedicalHistoryPayload): Promise<MedicalHistory> {
    const res = await this.medicalHistoryService.createMedicalHistoryForDoctor(patientId, payload);
    return toMedicalHistoryModel(res);
  }
  
  async createMedicalHistoryForPatient(payload: CreateMedicalHistoryPayload): Promise<MedicalHistory> {
    const res = await this.medicalHistoryService.createMedicalHistoryForPatient(payload);
    return toMedicalHistoryModel(res);
  }
};

export default CreateMedicalHistoryRepository;
