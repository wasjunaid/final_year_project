import api from "./api";
import EndPoints from "../constants/endpoints";
import type { ApiResponse } from "../models/ApiResponse";
import type {
  LabTest,
  CreateLabTestRequest,
  UpdateLabTestRequest,
} from "../models/LabTest";

class LabTestApi {
  static async getAll(): Promise<ApiResponse<LabTest[]>> {
    const response = await api.get(EndPoints.labTest.getAll);
    return response.data;
  }

  static async create(
    payload: CreateLabTestRequest
  ): Promise<ApiResponse<LabTest>> {
    const response = await api.post(EndPoints.labTest.create, payload);
    return response.data;
  }

  static async update(
    payload: UpdateLabTestRequest
  ): Promise<ApiResponse<LabTest>> {
    const response = await api.put(
      EndPoints.labTest.update.replace(
        ":lab_test_id",
        String(payload.lab_test_id)
      ),
      payload
    );
    return response.data;
  }
}

export default LabTestApi;
