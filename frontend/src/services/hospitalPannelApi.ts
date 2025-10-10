import EndPoints from "../constants/endpoints";
import type { ApiResponse } from "../models/ApiResponse";
import {
  type HospitalPannel,
  type InsertHospitalPannelRequest,
} from "../models/HospitalPannel";
import api from "./api";

class HospitalPannelApi {
  static async getAll(): Promise<ApiResponse<HospitalPannel[]>> {
    const response = await api.get(EndPoints.hospitalPannel.getAll);
    return response.data;
  }

  static async insert(
    body: InsertHospitalPannelRequest
  ): Promise<ApiResponse<HospitalPannel>> {
    const response = await api.post(EndPoints.hospitalPannel.insert, body);
    return response.data;
  }

  static async remove(hospital_pannel_id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(
      EndPoints.hospitalPannel.getAll.replace(
        ":hospital_pannel_id",
        String(hospital_pannel_id)
      )
    );
    return response.data;
  }
}

export default HospitalPannelApi;
