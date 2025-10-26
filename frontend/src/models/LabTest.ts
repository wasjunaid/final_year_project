export interface LabTest {
  lab_test_id: number;
  name: string;
  description?: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLabTestRequest {
  name: string;
  description?: string;
  cost: number;
}

export interface UpdateLabTestRequest {
  lab_test_id: number;
  name?: string;
  description?: string;
  cost?: number;
}