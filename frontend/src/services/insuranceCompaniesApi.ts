import api from "./api";
import EndPoints from "../constants/endpoints";
import type { ApiResponse } from "../models/ApiResponse";
import type {
  CreateInsuranceCompanyRequest,
  InsuranceCompany,
  UpdateInsuranceCompanyRequest,
} from "../models/InsuranceCompany";

export class InsuranceCompanyApi {
  // GET /insurance/company
  static async getInsuranceCompanies(): Promise<
    ApiResponse<InsuranceCompany[]>
  > {
    const response = await api.get(EndPoints.insuranceCompany.getAll);
    return response.data;
  }

  // POST /insurance/company
  static async createInsuranceCompany(
    body: CreateInsuranceCompanyRequest
  ): Promise<ApiResponse<CreateInsuranceCompanyRequest>> {
    const response = await api.post(EndPoints.insuranceCompany.create, body);
    return response.data;
  }

  // PUT /insurance/company/:insurance_company_id
  static async updateInsuranceCompany(
    insurance_company_id: number,
    body: UpdateInsuranceCompanyRequest
  ): Promise<ApiResponse<null>> {
    const response = await api.put(
      EndPoints.insuranceCompany.update.replace(
        ":insurance_company_id",
        String(insurance_company_id)
      ),
      body
    );
    return response.data;
  }

  // DELETE /insurance/company/:insurance_company_id
  static async deleteInsuranceCompany(
    insurance_company_id: number
  ): Promise<ApiResponse<null>> {
    const response = await api.delete(
      EndPoints.insuranceCompany.delete.replace(
        ":insurance_company_id",
        String(insurance_company_id)
      )
    );
    return response.data;
  }
}

export default InsuranceCompanyApi;
