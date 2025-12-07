import type { SystemSubAdminModel, HospitalAdminModel } from '../../models/systemAdminUserManagement/model';
import type { CreateSystemSubAdminPayload, CreateHospitalAdminPayload } from '../../models/systemAdminUserManagement/payload';
import { toSystemSubAdminModels, toHospitalAdminModels, toSystemSubAdminModel, toHospitalAdminModel } from '../../models/systemAdminUserManagement/transformers';
import { validators } from '../../utils/validations';
import { AppError } from '../../utils/appError';

// Factory to create system admin user management repository with DI for service
export const createSystemAdminUserManagementRepository = ({ systemAdminUserManagementService }: { systemAdminUserManagementService: any }) => {
  return {
    // System Sub Admins
    async getAllSystemSubAdmins(): Promise<SystemSubAdminModel[]> {
      try {
        const response = await systemAdminUserManagementService.getAllSystemSubAdmins();
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to fetch system sub admins',
            title: 'Fetch Failed'
          });
        }

        return toSystemSubAdminModels(response.data || []);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch system sub admins';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },

    async createSystemSubAdmin(payload: CreateSystemSubAdminPayload): Promise<SystemSubAdminModel> {
      validators.email(payload.email);

      try {
        const response = await systemAdminUserManagementService.createSystemSubAdmin(payload);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to create system sub admin',
            title: 'Creation Failed'
          });
        }

        return toSystemSubAdminModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create system sub admin';
        throw new AppError({ message: errorMessage, title: 'Creation Failed' });
      }
    },

    async deleteSystemSubAdmin(systemAdminId: number): Promise<void> {
      try {
        const response = await systemAdminUserManagementService.deleteSystemSubAdmin(systemAdminId);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to delete system sub admin',
            title: 'Deletion Failed'
          });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete system sub admin';
        throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
      }
    },

    // Hospital Admins
    async getAllHospitalAdmins(): Promise<HospitalAdminModel[]> {
      try {
        const response = await systemAdminUserManagementService.getAllHospitalAdmins();
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to fetch hospital admins',
            title: 'Fetch Failed'
          });
        }

        return toHospitalAdminModels(response.data || []);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch hospital admins';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },

    async createHospitalAdmin(payload: CreateHospitalAdminPayload): Promise<HospitalAdminModel> {
      validators.email(payload.email);

      if (!payload.hospital_id) {
        throw new AppError({
          message: 'Hospital is required',
          title: 'Validation Error'
        });
      }

      try {
        const response = await systemAdminUserManagementService.createHospitalAdmin(payload);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to create hospital admin',
            title: 'Creation Failed'
          });
        }

        return toHospitalAdminModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create hospital admin';
        throw new AppError({ message: errorMessage, title: 'Creation Failed' });
      }
    },

    async deleteHospitalAdmin(hospitalStaffId: number): Promise<void> {
      try {
        const response = await systemAdminUserManagementService.deleteHospitalAdmin(hospitalStaffId);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to delete hospital admin',
            title: 'Deletion Failed'
          });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete hospital admin';
        throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
      }
    },
  };
};
