import type { LabTestDto } from "./dto";
import type { LabTest } from "./model";

export const toLabTestModel = (dto: LabTestDto): LabTest => {
  return {
    labTestId: dto.lab_test_id,
    hospitalId: dto.hospital_id,
    name: dto.name,
    description: dto.description,
    cost: dto.cost,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}