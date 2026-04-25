import type { HospitalPanelListModel } from '../../models/hospitalPanelList/model';
import type { CreateHospitalPanelListPayload } from '../../models/hospitalPanelList/payload';
import { toHospitalPanelListModels, toHospitalPanelListModel } from '../../models/hospitalPanelList/transformers';
import { AppError } from '../../utils/appError';

// Factory to create hospital panel list repository with DI for service
export const createHospitalPanelListRepository = ({ hospitalPanelListService }: { hospitalPanelListService: any }) => {
  return {
    async getAllHospitalPanelList(): Promise<HospitalPanelListModel[]> {
      try {
        const response = await hospitalPanelListService.getAllHospitalPanelList();
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to fetch hospital panel list',
            title: 'Fetch Failed'
          });
        }

        return toHospitalPanelListModels(response.data || []);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch hospital panel list';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },

    async createHospitalPanelList(payload: CreateHospitalPanelListPayload): Promise<HospitalPanelListModel> {
      // Validate insurance_company_id
      if (!payload.insurance_company_id) {
        throw new AppError({
          message: 'Insurance company is required',
          title: 'Validation Error'
        });
      }

      try {
        const response = await hospitalPanelListService.createHospitalPanelList(payload);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to add insurance company to panel',
            title: 'Creation Failed'
          });
        }

        return toHospitalPanelListModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to add insurance company to panel';
        throw new AppError({ message: errorMessage, title: 'Creation Failed' });
      }
    },

    async deleteHospitalPanelList(hospitalPanelListId: number): Promise<void> {
      if (!hospitalPanelListId) {
        throw new AppError({
          message: 'Hospital panel list ID is required',
          title: 'Validation Error'
        });
      }

      try {
        const response = await hospitalPanelListService.deleteHospitalPanelList(hospitalPanelListId);
        
        if (!response.success) {
          throw new AppError({
            message: response.message || 'Failed to remove insurance company from panel',
            title: 'Deletion Failed'
          });
        }
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to remove insurance company from panel';
        throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
      }
    },
  };
};
