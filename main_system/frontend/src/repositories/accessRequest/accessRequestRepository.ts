import accessRequestService from '../../services/accessRequest/accessRequestService';
import type { AccessRequestModel, BlockchainHistoryRecordModel } from '../../models/accessRequest/model';
import { toAccessRequestModels, toBlockchainHistoryRecordModels } from '../../models/accessRequest/transformers';
import { AppError } from '../../utils/appError';

const normalizeAccessRequestError = (error: any, fallbackTitle: string, fallbackMessage: string) => {
  const status = error?.response?.status;
  const message = (error?.response?.data?.message || error?.message || fallbackMessage || '').toString();

  if (status === 409 && /request flow|revoked on blockchain|cannot be requested again|invalid status for request/i.test(message)) {
    return new AppError({
      title: 'Request Not Allowed',
      message: 'This EHR access was revoked and cannot be renewed from the current flow. Please ask the patient to create a fresh request or use the appointment EHR tab if available.',
    });
  }

  if (status === 409 && /cannot deny|only requested requests can be denied|invalid status transition/i.test(message)) {
    return new AppError({
      title: 'Deny Not Allowed',
      message: 'This access request is no longer in a pending state, so it cannot be denied.',
    });
  }

  if (error instanceof AppError) return error;

  return new AppError({
    title: fallbackTitle,
    message,
  });
};

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
      throw normalizeAccessRequestError(error, 'Creation Failed', 'Failed to create request');
    }
  },

  async acceptRequest(id: number) {
    try {
      const resp = await accessRequestService.acceptRequest(id);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to accept', title: 'Accept Failed' });
    } catch (error: any) {
      throw normalizeAccessRequestError(error, 'Accept Failed', 'Failed to accept');
    }
  },

  async denyRequest(id: number) {
    try {
      const resp = await accessRequestService.denyRequest(id);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to deny', title: 'Deny Failed' });
    } catch (error: any) {
      throw normalizeAccessRequestError(error, 'Deny Failed', 'Failed to deny');
    }
  },

  async revokeRequest(id: number) {
    try {
      const resp = await accessRequestService.revokeRequest(id);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to revoke', title: 'Revoke Failed' });
    } catch (error: any) {
      throw normalizeAccessRequestError(error, 'Revoke Failed', 'Failed to revoke');
    }
  },

  async deleteRequest(id: number) {
    try {
      const resp = await accessRequestService.deleteRequest(id);
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to delete', title: 'Deletion Failed' });
    } catch (error: any) {
      throw normalizeAccessRequestError(error, 'Deletion Failed', 'Failed to delete');
    }
  },

  async fetchPatientEhr(patientId: number) {
    try {
      const resp = await accessRequestService.getPatientEhr(patientId);
      if (!resp || !resp.success) {
        console.error("Repository - returning null, resp or resp.success is falsy");
        return null;
      }
      // console.log("Repository - returning resp (full object with data and verification):", resp);
      // Return the full response object which contains data and verification
      return resp;
    } catch (error: any) {
      console.error("Repository - fetchPatientEhr error:", error);
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },

  async fetchBlockchainHistory(): Promise<BlockchainHistoryRecordModel[]> {
    try {
      const resp = await accessRequestService.getBlockchainHistory();
      if (!resp.success) throw new AppError({ message: resp.message || 'Failed to fetch blockchain history', title: 'Fetch Failed' });
      return toBlockchainHistoryRecordModels(resp.data || []);
    } catch (error: any) {
      if (error?.response?.status === 404) return [];
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch blockchain history';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },
};

export default accessRequestRepository;
