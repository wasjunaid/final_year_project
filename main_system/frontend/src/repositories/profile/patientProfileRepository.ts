import type {
  PatientProfileModel,
  PersonProfileModel,
} from '../../models/profile';
import {
  transformPatientDto,
  toUpdatePatientRequest,
  toUpdatePersonRequest,
} from '../../models/profile';
import { AppError } from '../../utils/appError';
import { profileService, personProfileService } from '../../services/profile';
import { PhoneNumberValidator } from '../../utils/phoneNumberValidation';
import { validators, ValidationError } from '../../utils/validations';
import type { CountryCodeValue } from '../../constants/countryCode';

// Factory to create profile repository
export const createPatientProfileRepository = () => {
  return {
    // Get patient profile
    async getPatient(): Promise<PatientProfileModel> {
      try {
        const { person, patient } = await profileService.getCompletePatientProfile();

        if (!person.success || !patient.success) {
          throw new AppError({
            message: 'Failed to load patient profile',
            title: 'Profile Error'
          });
        }

        return transformPatientDto(person.data, patient.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to load patient profile',
            title: 'Profile Error'
          });
        }

        throw error;
      }
    },

    // Update patient profile
    async updatePatient(data: Partial<PatientProfileModel>): Promise<PatientProfileModel> {
      try {
        // Separate person and patient fields
        const personFields: Partial<PersonProfileModel> = {};
        const patientFields: Partial<PatientProfileModel> = {};

        // Extract person fields
        if (data.firstName !== undefined) personFields.firstName = data.firstName;
        if (data.lastName !== undefined) personFields.lastName = data.lastName;
        if (data.cnic !== undefined) personFields.cnic = data.cnic;
        if (data.dateOfBirth !== undefined) personFields.dateOfBirth = data.dateOfBirth;
        if (data.gender !== undefined) personFields.gender = data.gender;
        if (data.address !== undefined) personFields.address = data.address;
        if (data.countryCode !== undefined) personFields.countryCode = data.countryCode;
        if (data.phoneNumber !== undefined) personFields.phoneNumber = data.phoneNumber;

        // Extract patient-specific fields
        if (data.emergencyContactCountryCode !== undefined) patientFields.emergencyContactCountryCode = data.emergencyContactCountryCode;
        if (data.emergencyContactNumber !== undefined) patientFields.emergencyContactNumber = data.emergencyContactNumber;
        if (data.bloodGroup !== undefined) patientFields.bloodGroup = data.bloodGroup;
        if (data.walletAddress !== undefined) patientFields.walletAddress = data.walletAddress;

        // Validate patient-specific fields
        if (patientFields.emergencyContactCountryCode && patientFields.emergencyContactNumber) {
          const validationResult = PhoneNumberValidator.validate(
            patientFields.emergencyContactNumber,
            patientFields.emergencyContactCountryCode as CountryCodeValue
          );

          if (!validationResult.isValid) {
            throw new AppError({
              message: `Emergency contact: ${validationResult.error || 'Invalid phone number format'}`,
              title: 'Validation Error'
            });
          }

          // Use the cleaned/normalized phone number
          patientFields.emergencyContactNumber = validationResult.formattedNumber;
        } else if (patientFields.emergencyContactCountryCode || patientFields.emergencyContactNumber) {
          throw new AppError({
            message: 'Both country code and number are required for emergency contact',
            title: 'Validation Error'
          });
        }

        if (patientFields.bloodGroup) {
          try {
            validators.bloodGroup(patientFields.bloodGroup);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new AppError({
                message: error.message,
                title: 'Validation Error'
              });
            }
          }
        }

        // Validate person phone if provided
        if (personFields.phoneNumber && personFields.countryCode) {
          const validationResult = PhoneNumberValidator.validate(
            personFields.phoneNumber,
            personFields.countryCode as CountryCodeValue
          );

          if (!validationResult.isValid) {
            throw new AppError({
              message: validationResult.error || 'Invalid phone number format',
              title: 'Validation Error'
            });
          }

          personFields.phoneNumber = validationResult.formattedNumber;
        } else if (personFields.phoneNumber || personFields.countryCode) {
          throw new AppError({
            message: 'Both country code and phone number are required',
            title: 'Validation Error'
          });
        }

        // Update both person and patient in parallel if both have fields
        const updates = [];
        
        if (Object.keys(personFields).length > 0) {
          const personRequest = toUpdatePersonRequest(personFields);
          updates.push(personProfileService.updatePerson(personRequest));
        }

        if (Object.keys(patientFields).length > 0) {
          const { patientProfileService } = await import('../../services/profile');
          const patientRequest = toUpdatePatientRequest(patientFields);
          updates.push(patientProfileService.updatePatient(patientRequest));
        }

        if (updates.length > 0) {
          const responses = await Promise.all(updates);
          
          // Check if all updates succeeded
          const allSuccess = responses.every(r => r.success);
          if (!allSuccess) {
            throw new AppError({
              message: 'Failed to update profile',
              title: 'Update Error'
            });
          }
        }

        // Re-fetch full profile after update
        return await this.getPatient();
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to update patient profile',
            title: 'Update Error'
          });
        }

        throw error;
      }
    },
  };
};

export type PatientProfileRepository = ReturnType<typeof createPatientProfileRepository>;

