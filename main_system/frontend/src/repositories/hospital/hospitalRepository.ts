import { hospitalService } from '../../services/hospital';
import { toHospitalModel, toHospitalModels } from '../../models/hospital/transformers';
import type { HospitalModel } from '../../models/hospital';
import type { CreateHospitalPayload, UpdateHospitalPayload } from '../../models/hospital/payload';
import { AppError } from '../../utils/appError';

// Repository layer - handles business logic, validation, and transformation
export class HospitalRepository {
  private normalizeOptional(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

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

  // Get hospital by id
  async getHospitalById(hospitalId: string): Promise<HospitalModel> {
    try {
      const response = await hospitalService.getHospitalById(hospitalId);
      
      if (!response.success || !response.data) {
        throw new AppError({ message: response.message || 'Failed to fetch hospital by id' });
      }

      return toHospitalModel(response.data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        message: error instanceof Error ? error.message : 'Failed to fetch hospital by id',
      });
    }
  }

  // Create new hospital
  async createHospital(payloadInput: CreateHospitalPayload): Promise<HospitalModel> {
    try {
      // Validation
      if (!payloadInput?.name || typeof payloadInput.name !== 'string') {
        throw new AppError({ message: 'Hospital name is required' });
      }

      const trimmedName = payloadInput.name.trim();
      
      if (trimmedName.length < 3) {
        throw new AppError({ message: 'Hospital name must be at least 3 characters long' });
      }

      if (trimmedName.length > 100) {
        throw new AppError({ message: 'Hospital name must be less than 100 characters' });
      }

      const payload: CreateHospitalPayload = {
        name: trimmedName,
        focal_person_name: this.normalizeOptional(payloadInput.focal_person_name),
        focal_person_email: this.normalizeOptional(payloadInput.focal_person_email),
        focal_person_phone: this.normalizeOptional(payloadInput.focal_person_phone),
        address: this.normalizeOptional(payloadInput.address),
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
  async updateHospital(hospitalId: number, payloadInput: UpdateHospitalPayload): Promise<HospitalModel> {
    try {
      // Validation
      if (!hospitalId || typeof hospitalId !== 'number') {
        throw new AppError({ message: 'Hospital ID is required' });
      }

      if (!payloadInput?.name || typeof payloadInput.name !== 'string') {
        throw new AppError({ message: 'Hospital name is required' });
      }

      const trimmedName = payloadInput.name.trim();
      
      if (trimmedName.length < 3) {
        throw new AppError({ message: 'Hospital name must be at least 3 characters long' });
      }

      if (trimmedName.length > 100) {
        throw new AppError({ message: 'Hospital name must be less than 100 characters' });
      }

      if (!payloadInput.wallet_address || typeof payloadInput.wallet_address !== 'string') {
        throw new AppError({ message: 'Wallet address is required' });
      }

      const trimmedWalletAddress = payloadInput.wallet_address.trim();

      if (trimmedWalletAddress.length === 0) {
        throw new AppError({ message: 'Wallet address cannot be empty' });
      }

      const payload: UpdateHospitalPayload = {
        name: trimmedName,
        wallet_address: trimmedWalletAddress,
        focal_person_name: this.normalizeOptional(payloadInput.focal_person_name),
        focal_person_email: this.normalizeOptional(payloadInput.focal_person_email),
        focal_person_phone: this.normalizeOptional(payloadInput.focal_person_phone),
        address: this.normalizeOptional(payloadInput.address),
        hospitalization_daily_charge: payloadInput.hospitalization_daily_charge ?? null,
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
