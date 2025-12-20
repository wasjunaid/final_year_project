export const ClaimStatus = {
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
};

export type ClaimStatusType = typeof ClaimStatus[keyof typeof ClaimStatus];

export interface BillModel {
  billId: number;
  appointmentId: number;
  amount: number;
  isClaim: boolean;
  claimStatus: string | null;
  transactionHash: string | null;
  blockNumber: string | null;
  fromWallet: string | null;
  toWallet: string | null;
  amountPaid: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

