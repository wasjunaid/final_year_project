import type { MedicalCoderProfileModel, PersonProfileModel } from '../../models/profile';
import { transformMedicalCoderDto, toUpdatePersonRequest } from '../../models/profile';
import { AppError } from '../../utils/appError';
import { profileService, personProfileService } from '../../services/profile';
import { PhoneNumberValidator } from '../../utils/phoneNumberValidation';
import { validators, ValidationError } from '../../utils/validations';
import type { CountryCodeValue } from '../../constants/countryCode';

// Factory to create medical coder profile repository
export const createMedicalCoderProfileRepository = () => {
  return {
    // Get medical coder profile
    async getMedicalCoder(): Promise<MedicalCoderProfileModel> {
      try {
        const { person, coder } = await profileService.getCompleteMedicalCoderProfile();

        if (!person.success || !coder.success) {
          throw new AppError({
            message: 'Failed to load medical coder profile',
            title: 'Profile Error'
          });
        }

        return transformMedicalCoderDto(person.data, coder.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to load medical coder profile',
            title: 'Profile Error'
          });
        }

        throw error;
      }
    },

    // Update medical coder profile (only person fields)
    async updateMedicalCoder(data: Partial<MedicalCoderProfileModel>): Promise<MedicalCoderProfileModel> {
      try {
        // Medical coder only has person fields, no coder-specific fields
        const personFields: Partial<PersonProfileModel> = {};

        // Extract person fields
        if (data.firstName !== undefined) personFields.firstName = data.firstName;
        if (data.lastName !== undefined) personFields.lastName = data.lastName;
        if (data.cnic !== undefined) personFields.cnic = data.cnic;
        if (data.dateOfBirth !== undefined) personFields.dateOfBirth = data.dateOfBirth;
        if (data.gender !== undefined) personFields.gender = data.gender;
        if (data.address !== undefined) personFields.address = data.address;
        if (data.countryCode !== undefined) personFields.countryCode = data.countryCode;
        if (data.phoneNumber !== undefined) personFields.phoneNumber = data.phoneNumber;

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

        // Validate CNIC if provided
        if (personFields.cnic) {
          try {
            validators.cnic(personFields.cnic);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new AppError({
                message: error.message,
                title: 'Validation Error'
              });
            }
          }
        }

        // Update person fields if any exist
        if (Object.keys(personFields).length > 0) {
          const personRequest = toUpdatePersonRequest(personFields);
          const response = await personProfileService.updatePerson(personRequest);

          if (!response.success) {
            throw new AppError({
              message: 'Failed to update profile',
              title: 'Update Error'
            });
          }
        }

        // Re-fetch full profile after update
        return await this.getMedicalCoder();
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to update medical coder profile',
            title: 'Update Error'
          });
        }

        throw error;
      }
    },
  };
};

export type MedicalCoderProfileRepository = ReturnType<typeof createMedicalCoderProfileRepository>;
