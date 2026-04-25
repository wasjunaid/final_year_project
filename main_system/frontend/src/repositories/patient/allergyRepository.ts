import type { Allergy } from "../../models/patient/allergy/model";
import type { CreateAllergyPayload } from "../../models/patient/allergy/payload";
import { toAllergyModel } from "../../models/patient/allergy/transformers";
import { type IAllergyService } from "../../services/patient/allergyService";

export interface IAllergyRepository {
  getAllergiesForPatient(): Promise<Allergy[]>;
  getAllergiesForDoctor(patientId: number): Promise<Allergy[]>;
  createAllergyForPatient(payload: CreateAllergyPayload): Promise<Allergy>;
  createAllergyForDoctor(patientId: number, payload: CreateAllergyPayload): Promise<Allergy>;
}

class CreateAllergyRepository implements IAllergyRepository {
  private readonly allergyService: IAllergyService;

  constructor(allergyService: IAllergyService) {
    this.allergyService = allergyService;
  }
  
  async getAllergiesForPatient(): Promise<Allergy[]> {
    const res = await this.allergyService.getAllergiesForPatient();
    return res.map(item => toAllergyModel(item));
  }

  async getAllergiesForDoctor(patientId: number): Promise<Allergy[]> {
    const res = await this.allergyService.getAllergiesForDoctor(patientId);
    return res.map(item => toAllergyModel(item));
  }

  async createAllergyForPatient(payload: CreateAllergyPayload): Promise<Allergy> {
    const res = await this.allergyService.createAllergyForPatient(payload);
    return toAllergyModel(res);
  }

  async createAllergyForDoctor(patientId: number, payload: CreateAllergyPayload): Promise<Allergy> {
    const res = await this.allergyService.createAllergyForDoctor(patientId, payload);
    return toAllergyModel(res);
  }
};

export default CreateAllergyRepository;
