import type { AccessRequestDto, BlockchainHistoryRecordDto } from './dto';
import type { AccessRequestModel, BlockchainHistoryRecordModel } from './model';

export const toAccessRequestModel = (dto: AccessRequestDto): AccessRequestModel => ({
  accessRequestId: dto.ehr_access_id,
  requesterId: dto.requester_id,
  patientId: dto.patient_id,
  documentId: dto.document_id ?? null,
  patientName: (dto as any).patient_name || `${dto.patient_first_name || ''} ${dto.patient_last_name || ''}`.trim() || undefined,
  patientEmail: dto.patient_email || undefined,
  doctorName: (dto as any).doctor_name || `${dto.doctor_first_name || ''} ${dto.doctor_last_name || ''}`.trim() || undefined,
  doctorEmail: dto.doctor_email || undefined,
  status: dto.status,
  createdAt: dto.created_at,
});

export const toAccessRequestModels = (dtos: AccessRequestDto[]): AccessRequestModel[] => dtos.map(toAccessRequestModel);

export const toBlockchainHistoryRecordModel = (dto: BlockchainHistoryRecordDto): BlockchainHistoryRecordModel => ({
  patientId: dto.patientId,
  doctorId: dto.doctorId,
  patientName: dto.patientName ?? null,
  patientEmail: dto.patientEmail ?? null,
  doctorName: dto.doctorName ?? null,
  doctorEmail: dto.doctorEmail ?? null,
  status: dto.status,
  timestamp: dto.timestamp,
  ipfsCID: dto.ipfsCID,
  dataHash: dto.dataHash,
});

export const toBlockchainHistoryRecordModels = (dtos: BlockchainHistoryRecordDto[]): BlockchainHistoryRecordModel[] => dtos.map(toBlockchainHistoryRecordModel);
