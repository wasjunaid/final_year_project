import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api';
import type { InsuranceCompanyDto } from '../../models/insurance/dto';
import type { CreateInsuranceCompanyPayload, UpdateInsuranceCompanyPayload } from '../../models/insurance/payload';

// Insurance service - pure HTTP helpers returning DTOs wrapped in ApiResponse
export const insuranceService = {
  async getAllInsuranceCompanies(): Promise<ApiResponse<InsuranceCompanyDto[]>> {
    const response = await apiClient.get<ApiResponse<InsuranceCompanyDto[]>>('/insurance-company');
    return response.data;
  },

  async createInsuranceCompany(payload: CreateInsuranceCompanyPayload): Promise<ApiResponse<InsuranceCompanyDto>> {
    const response = await apiClient.post<ApiResponse<InsuranceCompanyDto>>('/insurance-company', payload);
    return response.data;
  },

  async updateInsuranceCompany(
    insuranceCompanyId: number,
    payload: UpdateInsuranceCompanyPayload
  ): Promise<ApiResponse<InsuranceCompanyDto>> {
    const response = await apiClient.put<ApiResponse<InsuranceCompanyDto>>(
      `/insurance-company/${insuranceCompanyId}`,
      payload
    );
    return response.data;
  },
};
