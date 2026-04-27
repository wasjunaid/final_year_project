import React from 'react';
import TextInput from './TextInput';
import Dropdown from './Dropdown';
import type { PersonProfileModel } from '../models/profile';
import { PhoneNumberValidator } from '../utils/phoneNumberValidation';
import type { CountryCodeValue } from '../constants/countryCode';

interface PersonInfoSectionProps {
  formData: PersonProfileModel;
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
}

const PersonInfoSection: React.FC<PersonInfoSectionProps> = ({ 
  formData, 
  isEditing, 
  onChange 
}) => {
  // Format phone number for display
  const getFormattedPhone = (): string => {
    if (!formData.countryCode || !formData.phoneNumber) return '';
    
    // If in view mode, show formatted international number
    if (!isEditing) {
      const formatted = PhoneNumberValidator.formatForDisplay(
        formData.phoneNumber,
        formData.countryCode as CountryCodeValue
      );
      return formatted;
    }
    
    // If in edit mode, show raw number
    return formData.phoneNumber;
  };

  const phoneDisplayValue = getFormattedPhone();

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-4 md:p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text mb-4">
        Personal Information
      </h3>

      <div className="flex flex-wrap gap-4">
        <TextInput
          label="First Name"
          name="firstName"
          value={formData.firstName || ''}
          onChange={(e) => {
            onChange('firstName', e.target.value);
          }}
          disabled={!isEditing}
          placeholder="Enter first name"
          containerClassName="w-full md:w-[calc(50%-0.5rem)]"
        />

        <TextInput
          label="Last Name"
          name="lastName"
          value={formData.lastName || ''}
          onChange={(e) => {
            onChange('lastName', e.target.value);
          }}
          disabled={!isEditing}
          placeholder="Enter last name"
          containerClassName="w-full md:w-[calc(50%-0.5rem)]"
        />

        <TextInput
          label="Email"
          name="email"
          value={formData.email || ''}
          disabled={true}
          placeholder="email@example.com"
          containerClassName="w-full md:w-[calc(50%-0.5rem)]"
        />

        <TextInput
          label="CNIC"
          name="cnic"
          value={formData.cnic || ''}
          onChange={(e) => {
            onChange('cnic', e.target.value);
          }}
          disabled={!isEditing}
          placeholder="1234567890123"
          maxLength={13}
          containerClassName="w-full md:w-[calc(50%-0.5rem)]"
        />

        <TextInput
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth || ''}
          onChange={(e) => {
            onChange('dateOfBirth', e.target.value);
          }}
          disabled={!isEditing}
          containerClassName="w-full md:w-[calc(50%-0.5rem)]"
        />

        <Dropdown
          label="Gender"
          options={[
            { value: '', label: 'Select Gender' },
            { value: 'M', label: 'Male' },
            { value: 'F', label: 'Female' },
            { value: 'O', label: 'Other' },
          ]}
          value={formData.gender || ''}
          onChange={(value) => {
            onChange('gender', value);
          }}
          disabled={!isEditing}
          containerClassName="w-full md:w-[calc(50%-0.5rem)]"
        />

        {isEditing ? (
          <div className="w-full md:w-[calc(50%-0.5rem)] flex gap-2">
            <TextInput
              label="Code"
              name="countryCode"
              value={formData.countryCode || ''}
              onChange={(e) => {
                onChange('countryCode', e.target.value);
              }}
              disabled={!isEditing}
              placeholder="+92"
              containerClassName="w-20 shrink-0"
            />

            <TextInput
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={(e) => {
                onChange('phoneNumber', e.target.value);
              }}
              disabled={!isEditing}
              placeholder="3001234567"
              containerClassName="flex-1"
            />
          </div>
        ) : (
          <TextInput
            label="Phone Number"
            name="phoneDisplay"
            value={phoneDisplayValue}
            disabled={true}
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />
        )}

        <TextInput
          label="Address"
          name="address"
          value={formData.address || ''}
          onChange={(e) => {
            onChange('address', e.target.value);
          }}
          disabled={!isEditing}
          placeholder="Enter full address"
          containerClassName="w-full"
        />
      </div>
    </div>
  );
};

export default PersonInfoSection;
