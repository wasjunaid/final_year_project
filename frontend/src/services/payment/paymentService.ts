import apiClient from '../apiClient';
import type { ApiResponse } from '../../models/api/dto';
import type { WalletBalanceDto, PaymentHistoryDto } from '../../models/payment';

export const paymentService = {
  async getWalletBalance(walletAddress: string): Promise<ApiResponse<WalletBalanceDto>> {
    const response = await apiClient.get<ApiResponse<WalletBalanceDto>>(
      `/payment/balance/${walletAddress}`
    );
    return response.data;
  },

  async getPatientPaymentHistory(walletAddress: string): Promise<ApiResponse<PaymentHistoryDto>> {
    const response = await apiClient.get<ApiResponse<PaymentHistoryDto>>(
      `/payment/history/patient/${walletAddress}`
    );
    return response.data;
  },

  async getHospitalPaymentHistory(walletAddress: string): Promise<ApiResponse<PaymentHistoryDto>> {
    const response = await apiClient.get<ApiResponse<PaymentHistoryDto>>(
      `/payment/history/hospital/${walletAddress}`
    );
    return response.data;
  },

  async patientToHospital(
    amount: number,
    hospitalId: number,
    patientWalletAddress: string,
    claimId: number
  ): Promise<ApiResponse<any>> {
    console.log("[PaymentService] patient to hospital payload: ", {
      amount: String(amount),
      hospital_id: hospitalId,
      patient_wallet_address: patientWalletAddress,
      claim_id: claimId,
    });

    const response = await apiClient.post<ApiResponse<any>>('/payment/patient-to-hospital', {
      amount: String(amount),
      hospital_id: hospitalId,
      patient_wallet_address: patientWalletAddress,
      claim_id: claimId,
    });
    return response.data;
  },

  async insuranceToHospital(
    amount: number,
    hospitalId: number,
    insuranceWalletAddress: string,
    claimId: number
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/payment/insurance-to-hospital', {
      amount: String(amount),
      hospital_id: hospitalId,
      insurance_wallet_address: insuranceWalletAddress,
      claim_id: claimId,
    });
    return response.data;
  },
};
