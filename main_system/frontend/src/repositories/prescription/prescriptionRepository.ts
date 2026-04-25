import { prescriptionService } from '../../services/prescription';
import type { PrescriptionModel, CreatePrescriptionPayload } from '../../models/prescription';
import { toPrescriptionModels, toPrescriptionModel } from '../../models/prescription';
import { AppError } from '../../utils/appError';

export const prescriptionRepository = {
  async fetchCurrentPrescriptions(): Promise<PrescriptionModel[]> {
    try {
      const resp = await prescriptionService.getCurrentPrescriptionsForPatient();
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to fetch prescriptions', 
          title: 'Fetch Failed' 
        });
      }
      return toPrescriptionModels(resp.data || []);
    } catch (error: any) {
      if (error?.response?.status === 404) return [];
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch prescriptions';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },

  async fetchPrescriptionsForAppointment(appointmentId: number): Promise<PrescriptionModel[]> {
    try {
      const resp = await prescriptionService.getPrescriptionsForAppointment(appointmentId);
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to fetch prescriptions', 
          title: 'Fetch Failed' 
        });
      }
      return toPrescriptionModels(resp.data || []);
    } catch (error: any) {
      if (error?.response?.status === 404) return [];
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch prescriptions';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },

  async createPrescription(payload: CreatePrescriptionPayload): Promise<PrescriptionModel> {
    try {
      const resp = await prescriptionService.createPrescription(payload);
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to create prescription', 
          title: 'Creation Failed' 
        });
      }
      return toPrescriptionModel(resp.data);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create prescription';
      throw new AppError({ message: errorMessage, title: 'Creation Failed' });
    }
  },

  async retirePrescription(prescriptionId: number): Promise<void> {
    try {
      const resp = await prescriptionService.retirePrescription(prescriptionId);
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to retire prescription', 
          title: 'Retire Failed' 
        });
      }
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to retire prescription';
      throw new AppError({ message: errorMessage, title: 'Retire Failed' });
    }
  },
};
