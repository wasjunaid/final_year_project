import type { LabTest } from "../../models/labTest/model";
import type { CreateLabTestPayload, UpdateLabTestPayload } from "../../models/labTest/payload";
import { toLabTestModel } from "../../models/labTest/transformers";
import { type ILabTestService } from "../../services/labTest/LabTestService";

export interface ILabTestRepository {
    getAllLabTestsIfExists(): Promise<LabTest[]>;
    createLabTest(payload: CreateLabTestPayload): Promise<LabTest>;
    updateLabTest(labTestId: number, payload: UpdateLabTestPayload): Promise<LabTest>;
}

class CreateLabTestRepository implements ILabTestRepository {
  private readonly labTestService: ILabTestService

  constructor(labTestService: ILabTestService) {
    this.labTestService = labTestService;
  }
  
  async getAllLabTestsIfExists(): Promise<LabTest[]> {
    const res = await this.labTestService.getAllLabTestsIfExists();
    return res.map(test => toLabTestModel(test));
  }

  async createLabTest(payload: CreateLabTestPayload): Promise<LabTest> {
    const res = await this.labTestService.createLabTest(payload);
    return toLabTestModel(res);
  }

  async updateLabTest(labTestId: number, payload: UpdateLabTestPayload): Promise<LabTest> {
    const res = await this.labTestService.updateLabTest(labTestId, payload);
    return toLabTestModel(res);
  }
};

export default CreateLabTestRepository;