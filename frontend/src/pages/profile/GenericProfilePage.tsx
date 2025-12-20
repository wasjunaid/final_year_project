import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { usePersonProfileController } from '../../hooks/profile';
import Alert from '../../components/Alert';
import PersonInfoSection from '../../components/PersonInfoSection';
import type { PersonProfileModel } from '../../models/profile';

const GenericProfilePage: React.FC = () => {
  const {
    profile,
    loading,
    error,
    success,
    updateProfile,
    clearMessages,
    isEditing,
    setIsEditing,
  } = usePersonProfileController();

  const [formData, setFormData] = useState<PersonProfileModel | null>(null);

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
      setFormData(profile as PersonProfileModel);
    }
    setIsEditing(false);
    clearMessages();
  }, [profile, setIsEditing, clearMessages]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(profile as PersonProfileModel);
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
    </div>
  );
};

export default GenericProfilePage;
