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
};
