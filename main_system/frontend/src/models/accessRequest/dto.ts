import type { AccessRequestStatus } from "./enums";

export interface AccessRequestDto {
  ehr_access_id: number;
  requester_id: number; // doctor
  patient_id: number;
  document_id?: number | null;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_email?: string;
  doctor_first_name?: string;
  doctor_last_name?: string;
  doctor_email?: string;
  status: AccessRequestStatus;
  created_at?: string;
}

export type AccessRequestListDto = AccessRequestDto[];

export interface BlockchainHistoryRecordDto {
  patientId: number;
  doctorId: number;
  patientName?: string | null;
  patientEmail?: string | null;
  doctorName?: string | null;
  doctorEmail?: string | null;
  status: string; // REQUESTED, GRANTED, DENIED, REVOKED
  timestamp: string;
  ipfsCID: string | null;
  dataHash: string | null;
}

export type BlockchainHistoryListDto = BlockchainHistoryRecordDto[];
