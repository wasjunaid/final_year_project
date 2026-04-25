// src/services/paymentService.js
import api from '../config/api';

export const paymentService = {
  /**
   * Get wallet balance
   */
  getWalletBalance: async (walletAddress) => {
    const response = await api.get(`/payment/balance/${walletAddress}`);
    return response.data;
  },

  /**
   * Get insurance payment history
   */
  getInsurancePaymentHistory: async (walletAddress) => {
    const response = await api.get(`/payment/history/${walletAddress}`);
    return response.data;
  },

  /**
   * Make payment from insurance to hospital for a claim
   */
  makePaymentToHospital: async (claimId, hospitalId, amount, insuranceWalletAddress) => {
    const response = await api.post('/payment/to-hospital', {
      claim_id: claimId,
      hospital_id: hospitalId,
      amount: amount,
      insurance_wallet_address: insuranceWalletAddress,
    });
    return response.data;
  },
};
