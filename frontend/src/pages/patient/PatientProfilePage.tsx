import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { usePatientProfileController } from '../../hooks/profile';
import Alert from '../../components/Alert';
import Dropdown from '../../components/Dropdown';
import TextInput from '../../components/TextInput';
import PersonInfoSection from '../../components/PersonInfoSection';
import type { PatientProfileModel } from '../../models/profile';
import { PhoneNumberValidator } from '../../utils/phoneNumberValidation';
import type { CountryCodeValue } from '../../constants/countryCode';

const PatientProfilePage: React.FC = () => {
  const {
    profile,
    loading,
    error,
    success,
    updateProfile,
    clearMessages,
    isEditing,
    setIsEditing,
  } = usePatientProfileController();

  const [formData, setFormData] = useState<PatientProfileModel | null>(null);

  // Handler function for all field changes
  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev) => {
      const updated = prev ? { ...prev, [field]: value } : null;
      return updated;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData) return;

    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  }, [formData, updateProfile, setIsEditing]);

  const handleCancel = useCallback(() => {
    if (profile) {
      setFormData(profile as PatientProfileModel);
    }
    setIsEditing(false);
    clearMessages();
  }, [profile, setIsEditing, clearMessages]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(profile as PatientProfileModel);
    }
  }, [profile]);

  // Update navbar with edit/save/cancel buttons (reactive config)
  const navbarConfig = useMemo(() => ({
    title: 'Profile',
    actions: isEditing
      ? [
          {
            label: 'Cancel',
            onClick: handleCancel,
            variant: 'ghost' as const,
          },
          {
            label: loading ? 'Saving...' : 'Save',
            onClick: handleSubmit,
            variant: 'primary' as const,
            disabled: loading,
          },
        ]
      : [
          {
            label: 'Edit Profile',
            onClick: () => setIsEditing(true),
            variant: 'primary' as const,
          },
        ],
  }), [isEditing, loading, handleCancel, handleSubmit, setIsEditing]);
  
  useNavbarController(navbarConfig);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || !formData) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-6">
        <p className="text-gray-500 dark:text-dark-text-secondary">Unable to load profile</p>
      </div>
    );
  }

  // Format emergency phone for display
  const getFormattedEmergencyPhone = (): string => {
    if (!formData.emergencyContactCountryCode || !formData.emergencyContactNumber) return '';
    
    // If in view mode, show formatted international number
    if (!isEditing) {
      const formatted = PhoneNumberValidator.formatForDisplay(
        formData.emergencyContactNumber,
        formData.emergencyContactCountryCode as CountryCodeValue
      );
      return formatted;
    }
    
    // If in edit mode, show raw number
    return formData.emergencyContactNumber;
  };

  const emergencyPhoneDisplayValue = getFormattedEmergencyPhone();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Alerts */}
      {success && (
        <Alert
          type="success"
          title={success.title}
          message={success.message}
          subtitle={success.subtitle}
          onClose={clearMessages}
        />
      )}

      {error && (
        <Alert
          type="error"
          title={error.title}
          message={error.message}
          subtitle={error.subtitle}
          onClose={clearMessages}
        />
      )}

      {/* Personal Information */}
      <PersonInfoSection
        formData={formData}
        isEditing={isEditing}
        onChange={handleChange}
      />

      {/* Medical Information */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text mb-4">
          Medical Information
        </h3>

        <div className="flex flex-wrap gap-4">
          <Dropdown
            label="Blood Group"
            options={[
              { value: '', label: 'Select Blood Group' },
              { value: 'A+', label: 'A+' },
              { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' },
              { value: 'B-', label: 'B-' },
              { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' },
              { value: 'O+', label: 'O+' },
              { value: 'O-', label: 'O-' },
            ]}
            value={formData.bloodGroup || ''}
            onChange={(value) => handleChange('bloodGroup', value)}
            disabled={!isEditing}
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />

          <TextInput
            label="Wallet Address"
            name="walletAddress"
            value={formData.walletAddress || ''}
            onChange={(e) => handleChange('walletAddress', e.target.value)}
            disabled={!isEditing}
            placeholder="0x..."
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />

          {isEditing ? (
            <div className="w-full md:w-[calc(50%-0.5rem)] flex gap-2">
              <TextInput
                label="Code"
                name="emergencyContactCountryCode"
                value={formData.emergencyContactCountryCode || ''}
                onChange={(e) => handleChange('emergencyContactCountryCode', e.target.value)}
                disabled={!isEditing}
                placeholder="+92"
                containerClassName="w-20 shrink-0"
              />

              <TextInput
                label="Emergency Contact"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber || ''}
                onChange={(e) => handleChange('emergencyContactNumber', e.target.value)}
                disabled={!isEditing}
                placeholder="3001234567"
                containerClassName="flex-1"
              />
            </div>
          ) : (
            <TextInput
              label="Emergency Contact"
              name="emergencyContactDisplay"
              value={emergencyPhoneDisplayValue}
              disabled={true}
              containerClassName="w-full md:w-[calc(50%-0.5rem)]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfilePage;