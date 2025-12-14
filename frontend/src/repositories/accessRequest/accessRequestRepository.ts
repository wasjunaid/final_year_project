import accessRequestService from '../../services/accessRequest/accessRequestService';
import type { AccessRequestModel } from '../../models/accessRequest/model';
import { toAccessRequestModels } from '../../models/accessRequest/transformers';
import { AppError } from '../../utils/appError';

export const accessRequestRepository = {
  async fetchRequestsForPatient(): Promise<AccessRequestModel[]> {
    try {
      const resp = await accessRequestService.getRequestsForPatient();
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to fetch requests', title: 'Fetch Failed' });
      return toAccessRequestModels(resp.data || []);
    } catch (error: any) {
      if (error?.response?.status === 404) return [];
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch requests';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },

  async fetchRequestsForDoctor(): Promise<AccessRequestModel[]> {
    try {
      const resp = await accessRequestService.getRequestsForDoctor();
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to fetch requests', title: 'Fetch Failed' });
      return toAccessRequestModels(resp.data || []);
    } catch (error: any) {
      if (error?.response?.status === 404) return [];
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch requests';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },

  async createRequest(payload: any) {
    try {
      const resp = await accessRequestService.createRequest(payload);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to create request', title: 'Creation Failed' });
      return toAccessRequestModels([resp.data])[0];
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create request';
      throw new AppError({ message: errorMessage, title: 'Creation Failed' });
    }
  },

  async acceptRequest(id: number) {
    try {
      const resp = await accessRequestService.acceptRequest(id);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to accept', title: 'Accept Failed' });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to accept';
      throw new AppError({ message: errorMessage, title: 'Accept Failed' });
    }
  },

  async denyRequest(id: number) {
    try {
      const resp = await accessRequestService.denyRequest(id);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to deny', title: 'Deny Failed' });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deny';
      throw new AppError({ message: errorMessage, title: 'Deny Failed' });
    }
  },

  async revokeRequest(id: number) {
    try {
      const resp = await accessRequestService.revokeRequest(id);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to deny', title: 'Deny Failed' });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deny';
      throw new AppError({ message: errorMessage, title: 'Deny Failed' });
    }
  },

  async deleteRequest(id: number) {
    try {
      const resp = await accessRequestService.deleteRequest(id);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to delete', title: 'Deletion Failed' });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete';
      throw new AppError({ message: errorMessage, title: 'Deletion Failed' });
    }
  },

  async fetchPatientEhr(patientId: number) {
    try {
      const resp = await accessRequestService.getPatientEhr(patientId);
      if (!resp || !resp.success) return null;
      return resp.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },
};

export default accessRequestRepository;
