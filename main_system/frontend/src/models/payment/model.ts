export interface WalletBalanceModel {
  address: string;
  balance: string;
  balanceWei: string;
}

export interface PaymentTransactionModel {
  from: string;
  to: string;
  amount: string;
  amountWei: string;
  timestamp: number;
  date: string;
  transactionType: string; // "PATIENT" | "INSURANCE"
}

export interface PaymentHistoryModel {
  totalPaid: string;
  totalPaidWei: string;
  transactionCount: number;
  transactions: PaymentTransactionModel[];
}
