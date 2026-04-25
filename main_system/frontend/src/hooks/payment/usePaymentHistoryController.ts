import { useState, useEffect } from 'react';
import { useAuthController } from '../auth';
import { paymentRepository } from '../../repositories/payment';
import type { PaymentHistoryModel } from '../../models/payment';
import type { PatientProfileModel } from '../../models/profile';
import { profileService } from '../../services/profile';
import { hospitalRepository } from '../../repositories/hospital';

interface UsePaymentHistoryControllerProps {
  type: 'patient' | 'hospital';
}

export const usePaymentHistoryController = ({ type }: UsePaymentHistoryControllerProps) => {
  const { profileData } = useAuthController();
  const [patientWalletAddress, setPatientWalletAddress] = useState<string | null>(null);
  const [resolvingPatientWallet, setResolvingPatientWallet] = useState(type === 'patient');
  const [hospitalWalletAddress, setHospitalWalletAddress] = useState<string | null>(null);
  const [resolvingHospitalWallet, setResolvingHospitalWallet] = useState(type === 'hospital');
  
  // Get wallet address from patient profile
  // Note: For hospital type, wallet address needs to come from hospital entity, not profile
  const walletAddress = type === 'patient' 
    ? ((profileData as PatientProfileModel)?.walletAddress || patientWalletAddress)
    : hospitalWalletAddress;
    
  const [history, setHistory] = useState<PaymentHistoryModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type !== 'patient') {
      setPatientWalletAddress(null);
      setResolvingPatientWallet(false);
      return;
    }

    const profileWallet = (profileData as PatientProfileModel)?.walletAddress || null;
    if (profileWallet) {
      setPatientWalletAddress(profileWallet);
      setResolvingPatientWallet(false);
      return;
    }

    let active = true;

    const resolvePatientWalletAddress = async () => {
      setResolvingPatientWallet(true);
      try {
        const { patient } = await profileService.getCompletePatientProfile();
        if (active) {
          setPatientWalletAddress(patient?.data?.wallet_address || null);
        }
      } catch {
        if (active) {
          setPatientWalletAddress(null);
        }
      } finally {
        if (active) {
          setResolvingPatientWallet(false);
        }
      }
    };

    resolvePatientWalletAddress();

    return () => {
      active = false;
    };
  }, [type, (profileData as PatientProfileModel)?.walletAddress]);

  useEffect(() => {
    if (type !== 'hospital') {
      setHospitalWalletAddress(null);
      setResolvingHospitalWallet(false);
      return;
    }

    let active = true;

    const resolveHospitalWalletAddress = async () => {
      setResolvingHospitalWallet(true);

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
      } finally {
        if (active) {
          setResolvingHospitalWallet(false);
        }
      }
    };

    resolveHospitalWalletAddress();

    return () => {
      active = false;
    };
  }, [type]);

  const fetchHistory = async () => {
    if (!walletAddress) {
      setError('No wallet address configured');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = type === 'patient'
        ? await paymentRepository.fetchPatientPaymentHistory(walletAddress)
        : await paymentRepository.fetchHospitalPaymentHistory(walletAddress);
      
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type === 'patient' && resolvingPatientWallet) {
      return;
    }

    if (type === 'hospital' && resolvingHospitalWallet) {
      return;
    }

    if (walletAddress) {
      fetchHistory();
    } else {
      setHistory(null);
      setError('No wallet address configured');
    }
  }, [walletAddress, type, resolvingHospitalWallet, resolvingPatientWallet]);

  const clearError = () => setError(null);

  return {
    history,
    loading,
    error,
    walletAddress,
    fetchHistory,
    clearError,
  };
};
