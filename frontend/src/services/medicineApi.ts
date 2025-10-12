import api from "./api";
import EndPoints from "../constants/endpoints";
import type { ApiResponse } from "../models/ApiResponse";
import type {
  Medicine,
  CreateMedicineRequest,
  UpdateMedicineRequest,
} from "../models/Medicine";

class MedicineApi {
  static async getAll(): Promise<ApiResponse<Medicine[]>> {
    const response = await api.get(EndPoints.medicine.getAll);
    return response.data;
  }

  static async create(
    payload: CreateMedicineRequest
  ): Promise<ApiResponse<Medicine>> {
    const response = await api.post(EndPoints.medicine.create, payload);
    return response.data;
  }

  static async update(
    payload: UpdateMedicineRequest
  ): Promise<ApiResponse<Medicine>> {
    const response = await api.put(
      EndPoints.medicine.update.replace(
        ":medicine_id",
        String(payload.medicine_id)
      ),
      payload
    );
    return response.data;
  }
}

export default MedicineApi;
