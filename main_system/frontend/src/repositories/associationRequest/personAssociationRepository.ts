import type { PersonAssociationRequestModel } from '../../models/associationRequest/person/model';
import { toPersonAssociationRequestModels } from '../../models/associationRequest/person/transformers';
import { AppError } from '../../utils/appError';

export const createPersonAssociationRepository = ({ personAssociationService }: { personAssociationService: any }) => {
  return {
    async getRequestsForPerson(): Promise<PersonAssociationRequestModel[]> {
      try {
        const response = await personAssociationService.getRequestsForPerson();
        if (!response.success) throw new AppError({ message: response.message || 'Failed to fetch requests', title: 'Fetch Failed' });
        return toPersonAssociationRequestModels(response.data || []);
      } catch (error: any) {
        // Handle 404 separately to return empty array
        if (error?.response?.status === 404) return [];

        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch requests';
        throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
      }
    },

    async deletePersonRequest(requestId: number): Promise<void> {
      try {
        const response = await personAssociationService.deletePersonRequest(requestId);
        if (!response.success) throw new AppError({ message: response.message || 'Failed to delete request', title: 'Deletion Failed' });
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete request';
        throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
      }
    },

    async deleteAllPersonRequests(): Promise<void> {
      try {
        const response = await personAssociationService.deleteAllPersonRequests();
        if (!response.success) throw new AppError({ message: response.message || 'Failed to delete requests', title: 'Deletion Failed' });
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete requests';
        throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
      }
    },

    async acceptRequest(requestId: number): Promise<void> {
      try {
        const response = await personAssociationService.acceptRequest(requestId);
        if (!response.success) throw new AppError({ message: response.message || 'Failed to accept request', title: 'Accept Failed' });
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        const errorMessage = error.response?.data?.message || error.message || 'Failed to accept request';
        throw new AppError({ message: errorMessage, title: 'Accept Failed' });
      }
    },
  };
};
