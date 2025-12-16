import type { 
  WalletBalanceDto, 
  PaymentHistoryDto, 
  PaymentTransactionDto 
} from './dto';
import type { 
  WalletBalanceModel, 
  PaymentHistoryModel, 
  PaymentTransactionModel 
} from './model';

export const toWalletBalanceModel = (dto: WalletBalanceDto): WalletBalanceModel => {
  return {
    address: dto.address,
    balance: dto.balance,
    balanceWei: dto.balanceWei,
  };
};

export const toPaymentTransactionModel = (dto: PaymentTransactionDto): PaymentTransactionModel => {
  return {
    from: dto.from,
    to: dto.to,
    amount: dto.amount,
    amountWei: dto.amountWei,
    timestamp: dto.timestamp,
    date: dto.date,
    transactionType: dto.transactionType,
  };
};

export const toPaymentTransactionModels = (dtos: PaymentTransactionDto[]): PaymentTransactionModel[] => {
  return dtos.map(toPaymentTransactionModel);
};

export const toPaymentHistoryModel = (dto: PaymentHistoryDto): PaymentHistoryModel => {
  return {
    totalPaid: dto.totalPaid,
    totalPaidWei: dto.totalPaidWei,
    transactionCount: dto.transactionCount,
    transactions: toPaymentTransactionModels(dto.transactions),
  };
};
