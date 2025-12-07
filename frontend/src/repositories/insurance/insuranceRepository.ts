import type { InsuranceCompanyModel } from '../../models/insurance/model';
import type { CreateInsuranceCompanyPayload, UpdateInsuranceCompanyPayload } from '../../models/insurance/payload';
import { toInsuranceCompanyModels, toInsuranceCompanyModel } from '../../models/insurance/transformers';
import { validators } from '../../utils/validations';
import { AppError } from '../../utils/appError';

// Factory to create insurance repository with DI for service
export const createInsuranceRepository = ({ insuranceService }: { insuranceService: any }) => {
  return {
    async getAllInsuranceCompanies(): Promise<InsuranceCompanyModel[]> {
      try {
        const response = await insuranceService.getAllInsuranceCompanies();
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to fetch insurance companies',
            title: 'Fetch Failed'
          });
        }

        return toInsuranceCompanyModels(response.data || []);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch insurance companies';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },

    async createInsuranceCompany(payload: CreateInsuranceCompanyPayload): Promise<InsuranceCompanyModel> {
      // Validate name
      if (!payload.name || payload.name.trim().length === 0) {
        throw new AppError({
          message: 'Insurance company name is required',
          title: 'Validation Error'
        });
      }

      try {
        const response = await insuranceService.createInsuranceCompany(payload);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to create insurance company',
            title: 'Creation Failed'
          });
        }

        return toInsuranceCompanyModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create insurance company';
        throw new AppError({ message: errorMessage, title: 'Creation Failed' });
      }
    },

    async updateInsuranceCompany(
      insuranceCompanyId: number,
      payload: UpdateInsuranceCompanyPayload
    ): Promise<InsuranceCompanyModel> {
      // Validate name
      if (!payload.name || payload.name.trim().length === 0) {
        throw new AppError({
          message: 'Insurance company name is required',
          title: 'Validation Error'
        });
      }

      try {
        const response = await insuranceService.updateInsuranceCompany(insuranceCompanyId, payload);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to update insurance company',
            title: 'Update Failed'
          });
        }

        return toInsuranceCompanyModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update insurance company';
        throw new AppError({ message: errorMessage, title: 'Update Failed' });
      }
    },
  };
};
