import type { BillDto } from './dto';
import type { BillModel } from './model';

export const transformBillDto = (dto: BillDto): BillModel => ({
  billId: dto.bill_id,
  appointmentId: dto.appointment_id,
  amount: parseFloat(dto.amount),
  isClaim: dto.is_claim,
  claimStatus: dto.claim_status as any,
  transactionHash: dto.transaction_hash,
  blockNumber: dto.block_number,
  fromWallet: dto.from_wallet,
  toWallet: dto.to_wallet,
  amountPaid: parseFloat(dto.amount_paid),
  isPaid: dto.is_paid,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});
