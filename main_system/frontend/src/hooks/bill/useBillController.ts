import { useState, useCallback } from 'react';
import { billRepository } from '../../repositories/bill';
import { paymentService } from '../../services/payment';
import type { BillModel, PayBillPayload } from '../../models/bill';

export const useBillController = () => {
  const [bill, setBill] = useState<BillModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchBillByAppointmentId = useCallback(async (appointmentId: number) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBill = await billRepository.getBillByAppointmentId(appointmentId);
      setBill(fetchedBill);
      return fetchedBill;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bill';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const payBill = useCallback(async (payload: PayBillPayload) => {
    setPaymentProcessing(true);
    setError(null);
    try {
      // Call patient-to-hospital payment endpoint
      const response = await paymentService.patientToHospital(
        payload.amount,
        payload.hospital_id,
        payload.patient_wallet_address,
        payload.claim_id
      );
      
      // Refresh bill data to show updated transaction details
      if (bill) {
        await fetchBillByAppointmentId(bill.appointmentId);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      throw err;
    } finally {
      setPaymentProcessing(false);
    }
  }, [bill, fetchBillByAppointmentId]);

  const updateClaimStatus = useCallback(async (claimId: number, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBill = await billRepository.updateClaimStatus(claimId, status);
      setBill(updatedBill);
      return updatedBill;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update claim status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendClaim = useCallback(async (billId: number) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBill = await billRepository.resendClaim(billId);
      setBill(updatedBill);
      return updatedBill;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend claim';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    bill,
    loading,
    error,
    paymentProcessing,
    fetchBillByAppointmentId,
    payBill,
    updateClaimStatus,
    resendClaim,
    resetError,
  };
};
