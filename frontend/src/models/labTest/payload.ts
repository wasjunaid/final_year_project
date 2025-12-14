export interface CreateLabTestPayload {
  name: string;
  description: string;
  cost: number;
}

export interface UpdateLabTestPayload {
  name?: string;
  description?: string;
  cost?: number;
}