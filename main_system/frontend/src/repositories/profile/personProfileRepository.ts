import type { ApiResponse } from '../../models/api';
import type {
  PersonProfileModel,
} from '../../models/profile';
import type { PersonDTO } from '../../models/profile/dto';
import {
  transformPersonDto,
  toUpdatePersonRequest,
} from '../../models/profile';
import { AppError } from '../../utils/appError';
import { PhoneNumberValidator } from '../../utils/phoneNumberValidation';
import { validators, ValidationError } from '../../utils/validations';
import type { CountryCodeValue } from '../../constants/countryCode';

// Factory to create profile repository with DI for service
export const createPersonProfileRepository = ({ profileService }: { profileService: any }) => {
  return {
    // Get person profile
    async getPerson(): Promise<PersonProfileModel> {
      try {
        const response: ApiResponse<PersonDTO> = await profileService.getPerson();

        if (!response.success) {
          throw new AppError({
            message: 'Failed to load profile',
            title: 'Profile Error'
          });
        }

        return transformPersonDto(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to load profile',
            title: 'Profile Error'
          });
        }

        throw error;
      }
    },

    // Update person profile
    async updatePerson(data: Partial<PersonProfileModel>): Promise<PersonProfileModel> {
      try {
        // Validate CNIC if provided
        if (data.cnic) {
          try {
            validators.cnic(data.cnic);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new AppError({
                message: error.message,
                title: 'Validation Error'
              });
            }
          }
        }

        // Validate date of birth if provided
        if (data.dateOfBirth) {
          try {
            validators.dateOfBirth(data.dateOfBirth);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new AppError({
                message: error.message,
                title: 'Validation Error'
              });
            }
          }
        }

        // Validate gender if provided
        if (data.gender) {
          try {
            validators.gender(data.gender);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new AppError({
                message: error.message,
                title: 'Validation Error'
              });
            }
          }
        }

        // Validate phone number if provided
        if (data.phoneNumber && data.countryCode) {
          const validationResult = PhoneNumberValidator.validate(
            data.phoneNumber,
            data.countryCode as CountryCodeValue
          );

          if (!validationResult.isValid) {
            throw new AppError({
              message: validationResult.error || 'Invalid phone number format',
              title: 'Validation Error'
            });
          }

          // Use the cleaned/normalized phone number
          data.phoneNumber = validationResult.formattedNumber;
        } else if (data.phoneNumber || data.countryCode) {
          throw new AppError({
            message: 'Both country code and phone number are required',
            title: 'Validation Error'
          });
        }

        const requestData = toUpdatePersonRequest(data);
        
        const response = await profileService.updatePerson(requestData);

        if (!response.success) {
          throw new AppError({
            message: 'Failed to update profile',
            title: 'Update Error'
          });
        }

        return transformPersonDto(response.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error instanceof ValidationError) {
          throw new AppError({
            message: error.message,
            title: 'Validation Error'
          });
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to update profile',
            title: 'Update Error'
          });
        }

        throw error;
      }
    },
  };
};

export type PersonProfileRepository = ReturnType<typeof createPersonProfileRepository>;
