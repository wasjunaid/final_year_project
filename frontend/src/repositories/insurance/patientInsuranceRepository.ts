import type { PatientInsuranceModel } from '../../models/insurance/model';
import type { CreatePatientInsurancePayload, UpdatePatientInsurancePayload } from '../../models/insurance/payload';
import { toPatientInsuranceModels, toPatientInsuranceModel } from '../../models/insurance/transformers';
import { AppError } from '../../utils/appError';

// Factory to create patient insurance repository with DI for service
export const createPatientInsuranceRepository = ({ patientInsuranceService }: { patientInsuranceService: any }) => {
  return {
    async getAllPatientInsurances(): Promise<PatientInsuranceModel[]> {
      try {
        const response = await patientInsuranceService.getAllPatientInsurances();
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to fetch patient insurances',
            title: 'Fetch Failed'
          });
        }
        return toPatientInsuranceModels(response.data || []);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch patient insurances';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },

    async createPatientInsurance(payload: CreatePatientInsurancePayload): Promise<PatientInsuranceModel> {
      // Validate required fields
      if (!payload.insurance_company_id) {
        throw new AppError({
          message: 'Insurance company is required',
          title: 'Validation Error'
        });
      }

      if (!payload.insurance_number || payload.insurance_number.trim().length === 0) {
        throw new AppError({
          message: 'Insurance number is required',
          title: 'Validation Error'
        });
      }

      if (!payload.policy_holder_name || payload.policy_holder_name.trim().length === 0) {
        throw new AppError({
          message: 'Policy holder name is required',
          title: 'Validation Error'
        });
      }

      if (!payload.relationship_to_holder || payload.relationship_to_holder.trim().length === 0) {
        throw new AppError({
          message: 'Relationship to holder is required',
          title: 'Validation Error'
        });
      }

      try {
        const response = await patientInsuranceService.createPatientInsurance(payload);
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to create patient insurance',
            title: 'Creation Failed'
          });
        }
        return toPatientInsuranceModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create patient insurance';
        throw new AppError({ message: errorMessage, title: 'Creation Failed' });
      }
    },

    async updatePatientInsurance(
      patientInsuranceId: number,
      payload: UpdatePatientInsurancePayload
    ): Promise<PatientInsuranceModel> {
      try {
        const response = await patientInsuranceService.updatePatientInsurance(patientInsuranceId, payload);
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to update patient insurance',
            title: 'Update Failed'
          });
        }
        return toPatientInsuranceModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update patient insurance';
        throw new AppError({ message: errorMessage, title: 'Update Failed' });
      }
    },

    async deletePatientInsurance(patientInsuranceId: number): Promise<void> {
      try {
        const response = await patientInsuranceService.deletePatientInsurance(patientInsuranceId);
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to delete patient insurance',
            title: 'Deletion Failed'
          });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete patient insurance';
        throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
      }
    },

    async verifyPatientInsurance(patientInsuranceId: number): Promise<void> {
      try {
        const response = await patientInsuranceService.verifyPatientInsurance(patientInsuranceId);
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to send verification request',
            title: 'Verification Failed'
          });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification request';
        throw new AppError({ message: errorMessage, title: 'Verification Failed' });
      }
    },
  };
};
