export interface PayBillPayload {
  amount: number;
  hospital_id: number;
  patient_wallet_address: string;
  claim_id: number;
}

export interface UpdateClaimStatusPayload {
  claim_id: number;
  status: string;
}
