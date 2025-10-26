import api from './api';
import EndPoints from '../constants/endpoints';
import type { ApiResponse } from '../models/ApiResponse';
import type { 
  InsuranceCompany, 
  CreateInsuranceCompanyRequest, 
  UpdateInsuranceCompanyRequest
} from '../models/InsuranceCompany';

export const insuranceCompanyApi = {
  // GET /insurance-company
  get: async (): Promise<ApiResponse<InsuranceCompany[]>> => {
    const response = await api.get(EndPoints.insuranceCompany.get);
    return response.data;
  },

  // POST /insurance-company
  insert: async (data: CreateInsuranceCompanyRequest): Promise<ApiResponse<InsuranceCompany>> => {
    const response = await api.post(EndPoints.insuranceCompany.insert, data);
    return response.data;
  },

  // PUT /insurance-company/:insurance_company_id
  update: async (insurance_company_id: number, data: UpdateInsuranceCompanyRequest): Promise<ApiResponse<InsuranceCompany>> => {
    const url = EndPoints.insuranceCompany.update.replace(':insurance_company_id', insurance_company_id.toString());
    const response = await api.put(url, data);
    return response.data;
  },
};