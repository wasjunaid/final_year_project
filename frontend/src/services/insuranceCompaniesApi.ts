import api from "./api";
import EndPoints from "../constants/endpoints";
import type { ApiResponse } from "../models/ApiResponse";
import type {
  CreateInsuranceCompanyRequest,
  InsuranceCompany,
  UpdateInsuranceCompanyRequest,
} from "../models/InsuranceCompany";

export class InsuranceCompanyApi {
  // GET /insurance-company
  static async getInsuranceCompanies(): Promise<
    ApiResponse<InsuranceCompany[]>
  > {
    const response = await api.get(EndPoints.insuranceCompany.getAll);
    return response.data;
  }

  // POST /insurance-company
  static async createInsuranceCompany(
    body: CreateInsuranceCompanyRequest
  ): Promise<ApiResponse<CreateInsuranceCompanyRequest>> {
    const response = await api.post(EndPoints.insuranceCompany.create, body);
    return response.data;
  }

  // PUT /insurance-company/:id
  static async updateInsuranceCompany(
    id: number,
    body: UpdateInsuranceCompanyRequest
  ): Promise<ApiResponse<UpdateInsuranceCompanyRequest>> {
    console.log("Updating company with ID:", id, "and data:", body);
    const response = await api.put(
      `${EndPoints.insuranceCompany.update}/${id}`,
      body
    );
    return response.data;
  }

  // DELETE /insurance-company/:id
  static async deleteInsuranceCompany(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete(
      `${EndPoints.insuranceCompany.delete}/${id}`
    );
    return response.data;
  }
}

export default InsuranceCompanyApi;
