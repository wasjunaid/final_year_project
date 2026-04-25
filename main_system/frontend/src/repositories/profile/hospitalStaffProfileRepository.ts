import type { HospitalStaffProfileModel } from '../../models/profile';
import { transformHospitalStaffDto } from '../../models/profile';
import { AppError } from '../../utils/appError';
import { profileService } from '../../services/profile';

// Factory to create hospital staff profile repository
export const createHospitalStaffProfileRepository = () => {
  return {
    // Get hospital staff profile
    async getHospitalStaff(): Promise<HospitalStaffProfileModel> {
      try {
        const { person, staff } = await profileService.getCompleteHospitalStaffProfile();

        if (!person.success || !staff.success) {
          throw new AppError({
            message: 'Failed to load hospital staff profile',
            title: 'Profile Error'
          });
        }

        return transformHospitalStaffDto(person.data, staff.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to load hospital staff profile',
            title: 'Profile Error'
          });
        }

        throw error;
      }
    },

    // Update hospital staff profile (if needed in the future)
    async updateHospitalStaff(_data: Partial<HospitalStaffProfileModel>): Promise<HospitalStaffProfileModel> {
      try {
        // Re-fetch full profile after update
        return await this.getHospitalStaff();
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to update hospital staff profile',
            title: 'Update Error'
          });
        }

        throw error;
      }
    },
  };
};

export type HospitalStaffProfileRepository = ReturnType<typeof createHospitalStaffProfileRepository>;
