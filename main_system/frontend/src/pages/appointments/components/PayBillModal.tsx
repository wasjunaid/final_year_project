import { useState } from "react";
import { X } from "lucide-react";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import { useBillController } from "../../../hooks/bill";
import { useAuthController } from "../../../hooks/auth";
import type { BillModel, PayBillPayload } from "../../../models/bill";
import type { PatientProfileModel } from "../../../models/profile";
import { ClaimStatus } from "../../../models/bill/model";

interface PayBillModalProps {
  bill: BillModel;
  hospitalId?: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PayBillModal: React.FC<PayBillModalProps> = ({ bill, hospitalId, onClose, onPaymentSuccess }) => {
  const { payBill, paymentProcessing, error } = useBillController();
  const { profileData } = useAuthController();
  const [localError, setLocalError] = useState<string | null>(null);

  const patientProfile = profileData as PatientProfileModel;
  const walletAddress = patientProfile?.walletAddress;

  const handlePayment = async () => {
    setLocalError(null);

    if (!bill.isClaim || bill.claimStatus !== ClaimStatus.REJECTED) {
      setLocalError('Payment is allowed only when the insurance claim is rejected.');
      return;
    }

    // Validate wallet address
    if (!walletAddress) {
      setLocalError("Wallet address not found in your profile");
      return;
    }

    // Validate hospital ID
    if (!hospitalId) {
      setLocalError("Hospital information not available");
      return;
    }

    const payload: PayBillPayload = {
      amount: bill.amount,
      hospital_id: hospitalId,
      patient_wallet_address: walletAddress,
      claim_id: bill.billId,
    };

    try {
      await payBill(payload);
      onPaymentSuccess();
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Payment failed");
    }
  };

  const claimStatusColor: Record<string, string> = {
    [ClaimStatus.PENDING]: "text-yellow-600",
    [ClaimStatus.REJECTED]: "text-red-600",
    [ClaimStatus.APPROVED]: "text-green-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border dark:bg-dark-bg-secondary">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Pay Appointment Bill
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {(error || localError) && (
            <Alert
              type="error"
              title="Payment Error"
              message={error || localError || ""}
              onClose={() => setLocalError(null)}
            />
          )}

          <div className="bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bill ID:</span>
              <span className="font-medium">#{bill.billId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Appointment ID:</span>
              <span className="font-medium">APT-{bill.appointmentId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-lg font-bold text-primary dark:text-dark-text">${bill.amount.toFixed(2)}</span>
            </div>

            {bill.isClaim && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Insurance Claim:</span>
                  <span className="font-medium">Yes</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Claim Status:</span>
                  <span className={`font-medium capitalize ${claimStatusColor[bill.claimStatus || '']}`}>
                    {bill.claimStatus}
                  </span>
                </div>
              </>
            )}

            {bill.isPaid && (
              <>
                <div className="pt-3 border-t border-gray-200 dark:border-dark-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    <span className="font-medium text-green-600">Paid</span>
                  </div>
                  
                  {bill.transactionHash && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Transaction:</span>
                      <span className="text-xs text-blue-600 break-all max-w-[200px] text-right">
                        {bill.transactionHash}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {bill.isClaim && bill.claimStatus === ClaimStatus.REJECTED && (
            <Alert
              type="warning"
              title="Insurance Claim Rejected"
              message="Your insurance claim was rejected. You can now pay directly for this appointment."
              onClose={() => {}}
            />
          )}

          {bill.isClaim && bill.claimStatus === ClaimStatus.PENDING && (
            <Alert
              type="info"
              title="Claim Pending"
              message="Your insurance claim is still pending. Payment is only available if the claim is rejected."
              onClose={() => {}}
            />
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Payment Method:</strong> Blockchain Payment
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Your wallet: {walletAddress ? 
                `${walletAddress.substring(0, 10)}...${walletAddress.substring(walletAddress.length - 8)}` 
                : 'Not configured'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={paymentProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePayment}
              disabled={paymentProcessing || bill.isPaid || !walletAddress || !bill.isClaim || bill.claimStatus !== ClaimStatus.REJECTED}
              loading={paymentProcessing}
            >
              {bill.isPaid ? 'Already Paid' : `Pay $${bill.amount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayBillModal;
