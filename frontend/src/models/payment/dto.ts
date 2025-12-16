export interface WalletBalanceDto {
  address: string;
  balance: string;
  balanceWei: string;
}

export interface PaymentTransactionDto {
  from: string;
  to: string;
  amount: string;
  amountWei: string;
  timestamp: number;
  date: string;
  transactionType: string; // "PATIENT" | "INSURANCE"
}

export interface PaymentHistoryDto {
  totalPaid: string;
  totalPaidWei: string;
  transactionCount: number;
  transactions: PaymentTransactionDto[];
}
