import { hospitalService } from '../../services/hospital';
import { toHospitalModel, toHospitalModels } from '../../models/hospital/transformers';
import type { HospitalModel } from '../../models/hospital';
import type { CreateHospitalPayload, UpdateHospitalPayload } from '../../models/hospital/payload';
import { AppError } from '../../utils/appError';

// Repository layer - handles business logic, validation, and transformation
export class HospitalRepository {
  // Get all hospitals
  async getAllHospitals(): Promise<HospitalModel[]> {
    try {
      const response = await hospitalService.getAllHospitals();
      
      if (!response.success || !response.data) {
        throw new AppError({ message: response.message || 'Failed to fetch hospitals' });
      }

      return toHospitalModels(response.data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: error instanceof Error ? error.message : 'Failed to fetch hospitals',
      });
    }
  }

  // Create new hospital
  async createHospital(name: string): Promise<HospitalModel> {
    try {
      // Validation
      if (!name || typeof name !== 'string') {
        throw new AppError({ message: 'Hospital name is required' });
      }

      const trimmedName = name.trim();
      
      if (trimmedName.length < 3) {
        throw new AppError({ message: 'Hospital name must be at least 3 characters long' });
      }

      if (trimmedName.length > 100) {
        throw new AppError({ message: 'Hospital name must be less than 100 characters' });
      }

      const payload: CreateHospitalPayload = {
        name: trimmedName,
      };

      const response = await hospitalService.createHospital(payload);

      if (!response.success || !response.data) {
        throw new AppError({ message: response.message || 'Failed to create hospital' });
      }

      return toHospitalModel(response.data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: error instanceof Error ? error.message : 'Failed to create hospital',
      });
    }
  }

  // Update hospital
  async updateHospital(hospitalId: number, name: string): Promise<HospitalModel> {
    try {
      // Validation
      if (!hospitalId || typeof hospitalId !== 'number') {
        throw new AppError({ message: 'Hospital ID is required' });
      }

      if (!name || typeof name !== 'string') {
        throw new AppError({ message: 'Hospital name is required' });
      }

      const trimmedName = name.trim();
      
      if (trimmedName.length < 3) {
        throw new AppError({ message: 'Hospital name must be at least 3 characters long' });
      }

      if (trimmedName.length > 100) {
        throw new AppError({ message: 'Hospital name must be less than 100 characters' });
      }

      const payload: UpdateHospitalPayload = {
        name: trimmedName,
      };

      const response = await hospitalService.updateHospital(hospitalId, payload);

      if (!response.success || !response.data) {
        throw new AppError({ message: response.message || 'Failed to update hospital' });
      }

      return toHospitalModel(response.data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: error instanceof Error ? error.message : 'Failed to update hospital',
      });
    }
  }
}
