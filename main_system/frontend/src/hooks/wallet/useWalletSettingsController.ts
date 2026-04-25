import { useState, useEffect } from 'react';
import { useAuthController } from '../auth';
import { paymentRepository } from '../../repositories/payment';
import type { WalletBalanceModel } from '../../models/payment';
import type { PatientProfileModel } from '../../models/profile';
import { ROLES } from '../../constants/profile';
import { profileService } from '../../services/profile';
import { hospitalRepository } from '../../repositories/hospital';

export const useWalletSettingsController = () => {
  const { profileData, role } = useAuthController();
  const patientProfile = profileData as PatientProfileModel;
  const [patientWalletAddress, setPatientWalletAddress] = useState<string | null>(null);
  const [hospitalWalletAddress, setHospitalWalletAddress] = useState<string | null>(null);
  const isHospitalRole = role === ROLES.HOSPITAL_ADMIN || role === ROLES.HOSPITAL_SUB_ADMIN;
  const walletAddress = isHospitalRole
    ? hospitalWalletAddress
    : (patientProfile?.walletAddress || patientWalletAddress || null);
  
  const [balance, setBalance] = useState<WalletBalanceModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isHospitalRole) {
      setPatientWalletAddress(null);
      return;
    }

    if (patientProfile?.walletAddress) {
      setPatientWalletAddress(patientProfile.walletAddress);
      return;
    }

    let active = true;

    const resolvePatientWalletAddress = async () => {
      try {
        const { patient } = await profileService.getCompletePatientProfile();
        const wallet = patient?.data?.wallet_address || null;
        if (active) {
          setPatientWalletAddress(wallet);
        }
      } catch {
        if (active) {
          setPatientWalletAddress(null);
        }
      }
    };

    resolvePatientWalletAddress();

    return () => {
      active = false;
    };
  }, [isHospitalRole, patientProfile?.walletAddress]);

  useEffect(() => {
    if (!isHospitalRole) {
      setHospitalWalletAddress(null);
      return;
    }

    let active = true;

    const resolveHospitalWalletAddress = async () => {
      try {
        const { staff } = await profileService.getCompleteHospitalStaffProfile();
        const hospitalId = staff?.data?.hospital_id;

        if (!hospitalId) {
          if (active) {
            setHospitalWalletAddress(null);
          }
          return;
        }

        const hospital = await hospitalRepository.getHospitalById(String(hospitalId));
        if (active) {
          setHospitalWalletAddress(hospital.wallet_address || null);
        }
      } catch {
        if (active) {
          setHospitalWalletAddress(null);
        }
      }
    };

    resolveHospitalWalletAddress();

    return () => {
      active = false;
    };
  }, [isHospitalRole]);

  // Fetch balance when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    } else {
      setBalance(null);
    }
  }, [walletAddress]);

  const fetchBalance = async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentRepository.fetchWalletBalance(address);
      setBalance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = () => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    }
  };

  const clearError = () => setError(null);

  return {
    walletAddress,
    balance,
    loading,
    error,
    refreshBalance,
    clearError,
  };
};
