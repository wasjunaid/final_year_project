import type { HospitalStaffModel } from '../../models/hospitalStaff/model';
import type { CreateHospitalStaffPayload } from '../../models/hospitalStaff/payload';
import { toHospitalStaffModels, toHospitalStaffModel } from '../../models/hospitalStaff/transformers';
import { AppError } from '../../utils/appError';

// Factory to create hospital staff repository with DI for service
export const createHospitalStaffRepository = ({ hospitalStaffService }: { hospitalStaffService: any }) => {
  return {
    async getAllHospitalStaff(): Promise<HospitalStaffModel[]> {
      try {
        const response = await hospitalStaffService.getAllHospitalStaff();
        if (!response.success) {
          throw new AppError({ message: response.message || 'Failed to fetch hospital staff', title: 'Fetch Failed' });
        }
        return toHospitalStaffModels(response.data || []);
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch hospital staff';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },

    async createHospitalStaff(payload: CreateHospitalStaffPayload): Promise<HospitalStaffModel> {
      try {
        const response = await hospitalStaffService.createHospitalStaff(payload);
        if (!response.success) {
          throw new AppError({ message: response.message || 'Failed to create hospital staff', title: 'Creation Failed' });
        }
        return toHospitalStaffModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create hospital staff';
        throw new AppError({ message: errorMessage, title: 'Creation Failed' });
      }
    },

    async deleteHospitalStaff(hospitalStaffId: number): Promise<void> {
      try {
        const response = await hospitalStaffService.deleteHospitalStaff(hospitalStaffId);
        if (!response.success) {
          throw new AppError({ message: response.message || 'Failed to delete hospital staff', title: 'Deletion Failed' });
        }
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete hospital staff';
        throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
      }
    },
  };
};
