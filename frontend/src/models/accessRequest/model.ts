import type { AccessRequestStatus } from "./enums";

export interface AccessRequestModel {
  accessRequestId: number;
  requesterId: number;
  patientId: number;
  documentId?: number | null;
  patientName?: string;
  patientEmail?: string;
  doctorName?: string;
  doctorEmail?: string;
  status: AccessRequestStatus;
  createdAt?: string;
}

export interface BlockchainHistoryRecordModel {
  patientId: number;
  doctorId: number;
  status: string;
  timestamp: string;
  ipfsCID: string | null;
  dataHash: string | null;
}

