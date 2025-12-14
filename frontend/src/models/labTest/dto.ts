export interface LabTestDto {
  lab_test_id: number;
  hospital_id: number;
  name: string;
  description?: string;
  cost: number;
  created_at?: Date;
  updated_at?: Date;
}