import { paymentService } from '../../services/payment';
import type { WalletBalanceModel, PaymentHistoryModel } from '../../models/payment';
import { toWalletBalanceModel, toPaymentHistoryModel } from '../../models/payment';
import { AppError } from '../../utils/appError';

export const paymentRepository = {
  async fetchWalletBalance(walletAddress: string): Promise<WalletBalanceModel> {
    try {
      const resp = await paymentService.getWalletBalance(walletAddress);
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to fetch wallet balance', 
          title: 'Fetch Failed' 
        });
      }
      return toWalletBalanceModel(resp.data);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch wallet balance';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },

  async fetchPatientPaymentHistory(walletAddress: string): Promise<PaymentHistoryModel> {
    try {
      const resp = await paymentService.getPatientPaymentHistory(walletAddress);
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to fetch payment history', 
          title: 'Fetch Failed' 
        });
      }
      return toPaymentHistoryModel(resp.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return {
          totalPaid: '0',
          totalPaidWei: '0',
          transactionCount: 0,
          transactions: [],
        };
      }
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch payment history';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },

  async fetchHospitalPaymentHistory(walletAddress: string): Promise<PaymentHistoryModel> {
    try {
      const resp = await paymentService.getHospitalPaymentHistory(walletAddress);
      if (!resp.success) {
        throw new AppError({ 
          message: resp.message || 'Failed to fetch payment history', 
          title: 'Fetch Failed' 
        });
      }
      return toPaymentHistoryModel(resp.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return {
          totalPaid: '0',
          totalPaidWei: '0',
          transactionCount: 0,
          transactions: [],
        };
      }
      if (error instanceof AppError) throw error;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch payment history';
      throw new AppError({ message: errorMessage, title: 'Fetch Failed' });
    }
  },
};
