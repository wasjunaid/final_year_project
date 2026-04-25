export interface BillDto {
  bill_id: number;
  appointment_id: number;
  amount: string; // decimal as string from backend
  is_claim: boolean;
  claim_status: string | null;
  transaction_hash: string | null;
  block_number: string | null;
  from_wallet: string | null;
  to_wallet: string | null;
  amount_paid: string; // decimal as string
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}
