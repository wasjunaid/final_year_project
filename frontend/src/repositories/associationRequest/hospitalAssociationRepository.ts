import type { HospitalAssociationRequestModel } from '../../models/associationRequest/hospital/model';
import type { CreateHospitalAssociationRequestPayload } from '../../models/associationRequest/hospital/payload';
import { toHospitalAssociationRequestModel, toHospitalAssociationRequestModels } from '../../models/associationRequest/hospital/transformers';
import { AppError } from '../../utils/appError';

export const createHospitalAssociationRepository = ({ hospitalAssociationService }: { hospitalAssociationService: any }) => {
  return {
    async getRequestsForHospitalStaff(): Promise<HospitalAssociationRequestModel[]> {
      try {
        const response = await hospitalAssociationService.getRequestsForHospitalStaff();
        if (!response.success) throw new AppError({ message: response.message || 'Failed to fetch requests', title: 'Fetch Failed' });
        return toHospitalAssociationRequestModels(response.data || []);
      } catch (error: any) {
        // Handle 404 separately to return empty array
        if (error?.response?.status === 404) return [];

        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch requests';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },

    async insertRequest(payload: CreateHospitalAssociationRequestPayload): Promise<HospitalAssociationRequestModel> {
      try {
        const response = await hospitalAssociationService.insertRequest(payload);
        if (!response.success) throw new AppError({ message: response.message || 'Failed to create request', title: 'Creation Failed' });
        return toHospitalAssociationRequestModel(response.data);
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create request';
        throw new AppError({ message: errorMessage, title: 'Creation Failed' });
      }
    },

    async deleteHospitalStaffRequest(requestId: number): Promise<void> {
      try {
        const response = await hospitalAssociationService.deleteHospitalStaffRequest(requestId);
        if (!response.success) throw new AppError({ message: response.message || 'Failed to delete request', title: 'Deletion Failed' });
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete request';
        throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
      }
    },
  };
};
