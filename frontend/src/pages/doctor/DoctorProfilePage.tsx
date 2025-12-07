import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useDoctorProfileController } from '../../hooks/profile';
import Alert from '../../components/Alert';
import TextInput from '../../components/TextInput';
import Dropdown from '../../components/Dropdown';
import PersonInfoSection from '../../components/PersonInfoSection';
import type { DoctorProfileModel } from '../../models/profile';

const DoctorProfilePage: React.FC = () => {
  const {
    profile,
    loading,
    error,
    success,
    updateProfile,
    clearMessages,
    isEditing,
    setIsEditing,
  } = useDoctorProfileController();

  const [formData, setFormData] = useState<DoctorProfileModel | null>(null);

  // Handler function for all field changes
  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
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
      setFormData(profile as DoctorProfileModel);
    }
    setIsEditing(false);
    clearMessages();
  }, [profile, setIsEditing, clearMessages]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(profile as DoctorProfileModel);
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
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-6">
        <p className="text-gray-500 dark:text-[#a0a0a0]">Unable to load profile</p>
      </div>
    );
  }

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

      {/* Doctor-Specific Information */}
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-[#e5e5e5] mb-4">
          Professional Information
        </h3>

        <div className="flex flex-wrap gap-4">
          <TextInput
            label="License Number"
            name="licenseNumber"
            value={formData.licenseNumber || ''}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
            disabled={!isEditing}
            placeholder="1234567890123"
            maxLength={13}
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />

          <TextInput
            label="Specialization"
            name="specialization"
            value={formData.specialization || ''}
            onChange={(e) => handleChange('specialization', e.target.value)}
            disabled={!isEditing}
            placeholder="e.g., Cardiology, Neurology"
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />

          <TextInput
            label="Years of Experience"
            type="number"
            name="yearsOfExperience"
            value={formData.yearsOfExperience?.toString() || ''}
            onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value) || 0)}
            disabled={!isEditing}
            placeholder="0"
            min="0"
            max="100"
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />

          <Dropdown
            label="Status"
            options={[
              { value: '', label: 'Select Status' },
              { value: 'active', label: 'Active' },
              // { value: 'inactive', label: 'Inactive' },
              { value: 'on_leave', label: 'On Leave' },
            ]}
            value={formData.status || ''}
            onChange={(value) => handleChange('status', value)}
            disabled={!isEditing}
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />

          <TextInput
            label="Sitting Start Time"
            type="time"
            name="sittingStart"
            value={formData.sittingStart || ''}
            onChange={(e) => handleChange('sittingStart', e.target.value)}
            disabled={!isEditing}
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />

          <TextInput
            label="Sitting End Time"
            type="time"
            name="sittingEnd"
            value={formData.sittingEnd || ''}
            onChange={(e) => handleChange('sittingEnd', e.target.value)}
            disabled={!isEditing}
            containerClassName="w-full md:w-[calc(50%-0.5rem)]"
          />
        </div>
      </div>

      {/* Hospital Information */}
      {formData.hospitalName && (
        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-[#e5e5e5] mb-4">
            Hospital Information
          </h3>

          <div className="flex flex-wrap gap-4">
            <TextInput
              label="Hospital Name"
              name="hospitalName"
              value={formData.hospitalName || ''}
              disabled={true}
              containerClassName="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfilePage;
