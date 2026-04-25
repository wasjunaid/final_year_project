import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useHospitalStaffProfileController, usePersonProfileController } from '../../hooks/profile';
import { useHospitalController } from '../../hooks/hospital';
import Alert from '../../components/Alert';
import PersonInfoSection from '../../components/PersonInfoSection';
import TextInput from '../../components/TextInput';
import type { PersonProfileModel } from '../../models/profile';
import type { HospitalModel } from '../../models/hospital';

const HospitalAdminProfilePage: React.FC = () => {
  const {
    profile: personProfile,
    loading: personLoading,
    error: personError,
    success: personSuccess,
    updateProfile: updatePersonProfile,
    clearMessages: clearPersonMessages,
    // fetchProfile,
  } = usePersonProfileController();

  const {
    hospitalById,
    loading: hospitalLoading,
    error: hospitalError,
    success: hospitalSuccess,
    updateHospital,
    fetchHospitalById,
    clearMessages: clearHospitalMessages,
  } = useHospitalController();

  const [hospital, setHospital] = useState<HospitalModel | null>();

  useEffect(() => {
    setHospital(hospitalById)
  }, [hospitalById]);

  const {profile : hospitalStaffProfile, fetchProfile: fetchHospitalStaffProfile } = useHospitalStaffProfileController();

  useEffect(() => {
    fetchHospitalStaffProfile();
  }, []); // Run once on mount

  useEffect(() => {
    if (hospitalStaffProfile?.hospitalId) {
      fetchHospitalById(hospitalStaffProfile.hospitalId.toString());
    }
  }, [hospitalStaffProfile]); // Run when hospitalStaffProfile changes

  const [isEditing, setIsEditing] = useState(false);
  const [personFormData, setPersonFormData] = useState<PersonProfileModel | null>(null);
  const [hospitalFormData, setHospitalFormData] = useState<HospitalModel | null>(null);

  // // Get hospital ID from person profile
  // const hospitalId = useMemo(() => {
  //   if (personProfile && 'hospitalId' in personProfile) {
  //     return (personProfile as HospitalStaffProfileModel).hospitalId;
  //   }
  //   return undefined;
  // }, [personProfile]);

  // Handler for person field changes
  const handlePersonChange = useCallback((field: string, value: any) => {
    setPersonFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  // Handler for hospital field changes
  const handleHospitalChange = useCallback((field: string, value: any) => {
    setHospitalFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  const handleSubmit = useCallback(async () => {
    let personUpdateSuccess = true;
    let hospitalUpdated = true;

    // Update person profile if there are changes
    if (personFormData) {
      personUpdateSuccess = await updatePersonProfile(personFormData);
    }

    // Update hospital if there are changes and hospital ID exists
    if (hospitalFormData) {
      const updated = await updateHospital(
        hospitalFormData.hospital_id,
        {
          name: hospitalFormData.name,
          wallet_address: hospitalFormData.wallet_address || '',
          focal_person_name: hospitalFormData.focal_person_name || null,
          focal_person_email: hospitalFormData.focal_person_email || null,
          focal_person_phone: hospitalFormData.focal_person_phone || null,
          address: hospitalFormData.address || null,
          hospitalization_daily_charge: hospitalFormData.hospitalization_daily_charge ?? null,
        }
      );
      hospitalUpdated = !!updated; // updateHospital returns HospitalModel | null
    }

    if (personUpdateSuccess && hospitalUpdated) {
      setIsEditing(false);
    }
  }, [personFormData, hospitalFormData, updatePersonProfile, updateHospital]);

  const handleCancel = useCallback(() => {
    if (personProfile) {
      setPersonFormData(personProfile as PersonProfileModel);
    }
    if (hospital) {
      setHospitalFormData(hospital);
    }
    setIsEditing(false);
    clearPersonMessages();
    clearHospitalMessages();
  }, [personProfile, hospital, clearPersonMessages, clearHospitalMessages]);

  // Initialize form data when profiles load
  useEffect(() => {
    if (personProfile) {
      setPersonFormData(personProfile as PersonProfileModel);
    }
  }, [personProfile]);

  useEffect(() => {
    if (hospital) {
      setHospitalFormData(hospital);
    }
  }, [hospital]);

  // Clear all messages when switching modes
  const clearAllMessages = useCallback(() => {
    clearPersonMessages();
    clearHospitalMessages();
  }, [clearPersonMessages, clearHospitalMessages]);

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
            label: personLoading || hospitalLoading ? 'Saving...' : 'Save',
            onClick: handleSubmit,
            variant: 'primary' as const,
            disabled: personLoading || hospitalLoading,
          },
        ]
      : [
          {
            label: 'Edit Profile',
            onClick: () => setIsEditing(true),
            variant: 'primary' as const,
          },
        ],
  }), [isEditing, personLoading, hospitalLoading, handleCancel, handleSubmit]);
  
  useNavbarController(navbarConfig);

  const loading = personLoading || hospitalLoading;
  const error = personError || hospitalError;
  const success = personSuccess || hospitalSuccess;

  if (loading && !personProfile && !hospital) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!personProfile || !personFormData) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-6">
        <p className="text-gray-500 dark:text-dark-text-secondary">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Alerts */}
      {success && (typeof success === 'string' ? (
        <Alert type="success" title={success} message="" onClose={clearAllMessages} />
      ) : (
        <Alert
          type="success"
          title={success.title}
          message={success.message}
          subtitle={success.subtitle}
          onClose={clearAllMessages}
        />
      ))}

      {error && (typeof error === 'string' ? (
        <Alert type="error" title={error} message="" onClose={clearAllMessages} />
      ) : (
        <Alert
          type="error"
          title={error.title}
          message={error.message}
          subtitle={error.subtitle}
          onClose={clearAllMessages}
        />
      ))}

      {/* Personal Information */}
      <PersonInfoSection
        formData={personFormData}
        isEditing={isEditing}
        onChange={handlePersonChange}
      />

      {/* Hospital Information */}
      {hospitalFormData && (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text mb-4">
            Hospital Information
          </h3>

          <div className="flex flex-wrap gap-4">
            <TextInput
              label="Hospital Name"
              name="name"
              value={hospitalFormData.name || ''}
              onChange={(e) => handleHospitalChange('name', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter hospital name"
              containerClassName="w-full md:w-[calc(50%-0.5rem)]"
            />

            <TextInput
              label="Wallet Address"
              name="wallet_address"
              value={hospitalFormData.wallet_address || ''}
              onChange={(e) => handleHospitalChange('wallet_address', e.target.value)}
              disabled={!isEditing}
              placeholder="0x..."
              containerClassName="w-full md:w-[calc(50%-0.5rem)]"
            />

            <TextInput
              label="Focal Person Name"
              name="focal_person_name"
              value={hospitalFormData.focal_person_name || ''}
              onChange={(e) => handleHospitalChange('focal_person_name', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter focal person name"
              containerClassName="w-full md:w-[calc(50%-0.5rem)]"
            />

            <TextInput
              label="Focal Person Email"
              name="focal_person_email"
              value={hospitalFormData.focal_person_email || ''}
              onChange={(e) => handleHospitalChange('focal_person_email', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter focal person email"
              containerClassName="w-full md:w-[calc(50%-0.5rem)]"
            />

            <TextInput
              label="Focal Person Phone"
              name="focal_person_phone"
              value={hospitalFormData.focal_person_phone || ''}
              onChange={(e) => handleHospitalChange('focal_person_phone', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter focal person phone"
              containerClassName="w-full md:w-[calc(50%-0.5rem)]"
            />

            <TextInput
              label="Hospitalization Daily Charge"
              name="hospitalization_daily_charge"
              value={hospitalFormData.hospitalization_daily_charge ? String(hospitalFormData.hospitalization_daily_charge) : ''}
              onChange={(e) => handleHospitalChange('hospitalization_daily_charge', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter hospitalization daily charge"
              containerClassName="w-full md:w-[calc(50%-0.5rem)]"
            />

            <TextInput
              label="Address"
              name="address"
              value={hospitalFormData.address || ''}
              onChange={(e) => handleHospitalChange('address', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter hospital address"
              containerClassName="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <TextInput
              label="Hospital ID"
              value={String(hospitalFormData.hospital_id)}
              disabled
            />

            <TextInput
              label="Created At"
              value={hospitalFormData.created_at ? new Date(hospitalFormData.created_at).toLocaleString() : ''}
              disabled
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminProfilePage;
