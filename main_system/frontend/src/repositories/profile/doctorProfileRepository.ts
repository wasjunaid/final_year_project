import type {
  DoctorProfileModel,
  PersonProfileModel,
} from '../../models/profile';
import {
  transformDoctorDto,
  toUpdateDoctorRequest,
  toUpdatePersonRequest,
} from '../../models/profile';
import { AppError } from '../../utils/appError';
import { profileService, personProfileService } from '../../services/profile';
import { validators, ValidationError } from '../../utils/validations';
import { PhoneNumberValidator } from '../../utils/phoneNumberValidation';
import type { CountryCodeValue } from '../../constants/countryCode';

// Factory to create profile repository
export const createDoctorProfileRepository = () => {
  return {
    // Get doctor profile
    async getDoctor(): Promise<DoctorProfileModel> {
      try {
        const { person, doctor } = await profileService.getCompleteDoctorProfile();

        if (!person.success || !doctor.success) {
          throw new AppError({
            message: 'Failed to load doctor profile',
            title: 'Profile Error'
          });
        }

        return transformDoctorDto(person.data, doctor.data);
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to load doctor profile',
            title: 'Profile Error'
          });
        }

        throw error;
      }
    },

    // Update doctor profile
    async updateDoctor(data: Partial<DoctorProfileModel>): Promise<DoctorProfileModel> {
      try {
        // Separate person and doctor fields
        const personFields: Partial<PersonProfileModel> = {};
        const doctorFields: Partial<DoctorProfileModel> = {};

        // Extract person fields
        if (data.firstName !== undefined) personFields.firstName = data.firstName;
        if (data.lastName !== undefined) personFields.lastName = data.lastName;
        if (data.cnic !== undefined) personFields.cnic = data.cnic;
        if (data.dateOfBirth !== undefined) personFields.dateOfBirth = data.dateOfBirth;
        if (data.gender !== undefined) personFields.gender = data.gender;
        if (data.address !== undefined) personFields.address = data.address;
        if (data.countryCode !== undefined) personFields.countryCode = data.countryCode;
        if (data.phoneNumber !== undefined) personFields.phoneNumber = data.phoneNumber;

        // Extract doctor-specific fields
        if (data.licenseNumber !== undefined) doctorFields.licenseNumber = data.licenseNumber;
        if (data.specialization !== undefined) doctorFields.specialization = data.specialization;
        if (data.yearsOfExperience !== undefined) doctorFields.yearsOfExperience = data.yearsOfExperience;
        if (data.sittingStart !== undefined) doctorFields.sittingStart = data.sittingStart;
        if (data.sittingEnd !== undefined) doctorFields.sittingEnd = data.sittingEnd;

        // Validate doctor-specific fields
        if (doctorFields.licenseNumber) {
          try {
            validators.licenseNumber(doctorFields.licenseNumber);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new AppError({
                message: error.message,
                title: 'Validation Error'
              });
            }
          }
        }

        if (doctorFields.yearsOfExperience !== undefined) {
          try {
            validators.yearsOfExperience(doctorFields.yearsOfExperience);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new AppError({
                message: error.message,
                title: 'Validation Error'
              });
            }
          }
        }

        if (doctorFields.sittingStart && doctorFields.sittingEnd) {
          try {
            validators.sittingHours(doctorFields.sittingStart, doctorFields.sittingEnd);
          } catch (error) {
            if (error instanceof ValidationError) {
              throw new AppError({
                message: error.message,
                title: 'Validation Error'
              });
            }
          }
        } else if (doctorFields.sittingStart || doctorFields.sittingEnd) {
          throw new AppError({
            message: 'Both sitting start and end times are required',
            title: 'Validation Error'
          });
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

        // Update both person and doctor in parallel if both have fields
        const updates = [];
        
        if (Object.keys(personFields).length > 0) {
          const personRequest = toUpdatePersonRequest(personFields);
          updates.push(personProfileService.updatePerson(personRequest));
        }

        if (Object.keys(doctorFields).length > 0) {
          const { doctorProfileService } = await import('../../services/profile');
          const doctorRequest = toUpdateDoctorRequest(doctorFields);
          updates.push(doctorProfileService.updateDoctor(doctorRequest));
        }

        if (updates.length > 0) {
          const responses = await Promise.all(updates);
          
          const allSuccess = responses.every(r => r.success);
          if (!allSuccess) {
            throw new AppError({
              message: 'Failed to update profile',
              title: 'Update Error'
            });
          }
        }

        // Re-fetch full profile after update
        return await this.getDoctor();
      } catch (error: any) {
        if (error instanceof AppError) {
          throw error;
        }

        if (error.response?.data) {
          const errorData = error.response.data;
          throw new AppError({
            message: errorData.message || 'Failed to update doctor profile',
            title: 'Update Error'
          });
        }

        throw error;
      }
    },
  };
};

export type DoctorProfileRepository = ReturnType<typeof createDoctorProfileRepository>;

