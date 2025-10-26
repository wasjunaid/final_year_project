export interface Medicine {
  medicine_id: number;
  name: string;
  created_at: string;
}

export interface CreateMedicineRequest {
  name: string;
}
