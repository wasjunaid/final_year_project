export interface LabTest {
  labTestId: number;
  hospitalId: number;
  name: string;
  description?: string;
  cost: number;
  createdAt?: Date;
  updatedAt?: Date;
}