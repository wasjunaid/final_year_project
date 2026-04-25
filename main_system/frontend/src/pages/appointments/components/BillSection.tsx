import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, CreditCard, AlertCircle } from 'lucide-react';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import { Badge } from '../../../components/TableHelpers';
import type { BillModel } from '../../../models/bill';
import { ClaimStatus } from '../../../models/bill/model';
import { billRepository } from '../../../repositories/bill';
import PayBillModal from './PayBillModal';
import { useAuthController } from '../../../hooks/auth';
import { ROLES } from '../../../constants/profile';

interface BillSectionProps {
  appointmentId: number;
  appointmentStatus: string;
  hospitalId?: number;
}

const BillSection: React.FC<BillSectionProps> = ({ appointmentId, appointmentStatus, hospitalId }) => {
  const { role } = useAuthController();
  const [bill, setBill] = useState<BillModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [resendingClaim, setResendingClaim] = useState(false);

  const isPatient = role === ROLES.PATIENT;

  useEffect(() => {
    if (appointmentStatus === 'completed') {
      fetchBill();
    }
  }, [appointmentId, appointmentStatus]);

  const fetchBill = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBill = await billRepository.getBillByAppointmentId(appointmentId);
      setBill(fetchedBill);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bill');
    } finally {
      setLoading(false);
    }
  };

  const getClaimStatusIcon = (status: string) => {
    switch (status) {
      case ClaimStatus.PENDING:
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case ClaimStatus.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case ClaimStatus.REJECTED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getClaimStatusVariant = (status: string): "primary" | "success" | "danger" | "warning" => {
    switch (status) {
      case ClaimStatus.PENDING:
        return "warning";
      case ClaimStatus.APPROVED:
        return "success";
      case ClaimStatus.REJECTED:
        return "danger";
      default:
        return "primary";
    }
  };

  const canPatientPay = () => {
    if (!bill || !isPatient) return false;
    if (bill.isPaid) return false;
    // Patient should only be able to pay when the insurance claim is rejected.
    return Boolean(bill.isClaim) && bill.claimStatus === ClaimStatus.REJECTED;
  };

  const canPatientResendClaim = () => {
    if (!bill || !isPatient) return false;
    if (bill.isPaid) return false;
    // Don't show resend if they can already pay (rejected case)
    if (canPatientPay()) return false;
    // Show if no claim has been sent yet, or claim was rejected and they chose not to pay
    return !bill.isClaim || bill.claimStatus === ClaimStatus.REJECTED;
  };

  const handleResendClaim = async () => {
    if (!bill) return;
    setResendingClaim(true);
    setError(null);
    try {
      console.log(`Attempting to resend claim for bill ID: ${bill.billId}`);
      await billRepository.resendClaim(bill.billId);
      await fetchBill();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend claim');
    } finally {
      setResendingClaim(false);
    }
  };

  if (appointmentStatus !== 'completed') {
    return (
      <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <p>Bill will be available once the appointment is completed.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow">
        <Alert type="error" title="Error Loading Bill" message={error} onClose={() => setError(null)} />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow">
        <Alert 
          type="info" 
          title="No Bill Found" 
          message="No bill has been generated for this appointment yet." 
          onClose={() => {}} 
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Bill Details</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bill ID: #{bill.billId}
            </p>
          </div>
          <Badge variant={bill.isPaid ? "success" : "warning"}>
            {bill.isPaid ? "Paid" : "Unpaid"}
          </Badge>
        </div>

        {/* Amount Section */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${bill.amount.toFixed(9)}
              </p>
            </div>
            {bill.isPaid && (
              <div className="text-green-600 dark:text-green-400">
                <CheckCircle className="w-12 h-12" />
              </div>
            )}
          </div>
        </div>

        {/* Insurance Claim Section */}
        {bill.isClaim && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Insurance Claim</span>
              </div>
              <Badge variant={getClaimStatusVariant(bill.claimStatus || '')}>
                <div className="flex items-center gap-1.5">
                  {getClaimStatusIcon(bill.claimStatus || '')}
                  <span className="capitalize">{bill.claimStatus}</span>
                </div>
              </Badge>
            </div>

            {bill.claimStatus === ClaimStatus.PENDING && (
              <Alert
                type="info"
                title="Claim Under Review"
                message={isPatient
                  ? "Your insurance claim is being processed. Payment is only available if the claim is rejected."
                  : "Insurance claim review is in progress. Please wait for review completion; no payment action is needed from the doctor."}
                onClose={() => {}}
              />
            )}

            {bill.claimStatus === ClaimStatus.REJECTED && (
              <Alert
                type="warning"
                title="Claim Rejected"
                message="Your insurance claim was rejected. Please proceed with direct payment."
                onClose={() => {}}
              />
            )}

            {bill.claimStatus === ClaimStatus.APPROVED && !bill.isPaid && (
              <Alert
                type="success"
                title="Claim Approved"
                message="Your insurance claim has been approved. Payment will be processed by the insurance company."
                onClose={() => {}}
              />
            )}
          </div>
        )}

        {/* Payment Transaction Details */}
        {bill.isPaid && bill.transactionHash && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Payment Completed
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${bill.amountPaid?.toFixed(2) || bill.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transaction Hash:</span>
                
                  href={`https://sepolia.etherscan.io/tx/${bill.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-mono text-xs break-all"
                <a>
                  {bill.transactionHash.substring(0, 10)}...{bill.transactionHash.substring(bill.transactionHash.length - 8)}
                </a>
              </div>
              {bill.blockNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Block Number:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{bill.blockNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Action Button */}
        {canPatientPay() && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* <Button
              type="button"
              variant="secondary"
              onClick={handleResendClaim}
              className="w-full mb-2"
              loading={resendingClaim}
              disabled={resendingClaim}
            >
              Resend Insurance Claim
            </Button> */}
            
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowPayModal(true)}
              className="w-full"
              icon={CreditCard}
            >
              Pay Now
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Payment will be processed securely via blockchain
            </p>
          </div>
        )}

        {canPatientResendClaim() && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={handleResendClaim}
              className="w-full"
              loading={resendingClaim}
              disabled={resendingClaim}
            >
              Resend Insurance Claim
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Use this if your claim was rejected or not sent previously.
            </p>
          </div>
        )}

        {/* Info for non-patients */}
        {!isPatient && !bill.isPaid && bill.isClaim && bill.claimStatus === ClaimStatus.APPROVED && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Alert
              type="info"
              title="Awaiting Insurance Payment"
              message="The insurance claim has been approved. Payment from the insurance company is pending."
              onClose={() => {}}
            />
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayModal && bill && (
        <PayBillModal
          bill={bill}
          hospitalId={hospitalId}
          onClose={() => setShowPayModal(false)}
          onPaymentSuccess={() => {
            setShowPayModal(false);
            fetchBill(); // Refresh bill to show updated payment status
          }}
        />
      )}
    </>
  );
};

export default BillSection;