import type { AccessRequestDto } from './dto';
import type { AccessRequestModel } from './model';

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
