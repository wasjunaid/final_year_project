import { create } from 'zustand';
import type { 
  PersonProfileModel, 
  PatientProfileModel, 
  DoctorProfileModel, 
  MedicalCoderProfileModel,
  HospitalStaffProfileModel 
} from '../../models/profile';

// Union type for all possible profile types
export type ProfileType = 
  | PersonProfileModel 
  | PatientProfileModel 
  | DoctorProfileModel 
  | MedicalCoderProfileModel 
  | HospitalStaffProfileModel;

export interface ProfileState {
  // State - Single profile that can be any role type
  profile: ProfileType | null;
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  setProfile: (profile: ProfileType) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
}

export const createProfileStore = () => {
  return create<ProfileState>((set) => ({
    // Initial state
    profile: null,
    isLoading: false,

    // Actions
    setProfile: (profile) => set({ profile }),
    
    clearProfile: () => set({ profile: null }),
    
    setLoading: (loading) => set({ isLoading: loading }),
  }));
};
