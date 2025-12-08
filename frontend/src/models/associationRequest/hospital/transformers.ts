import type { HospitalAssociationRequestDto } from './dto';
import type { HospitalAssociationRequestModel } from './model';

export const toHospitalAssociationRequestModel = (dto: HospitalAssociationRequestDto): HospitalAssociationRequestModel => ({
  hospital_association_request_id: dto.hospital_association_request_id,
  hospital_id: dto.hospital_id,
  person_id: dto.person_id,
  person_name: (dto as any).person_name || (((dto as any).person_first_name || (dto as any).person_last_name) ? `${((dto as any).person_first_name || '').trim()} ${((dto as any).person_last_name || '').trim()}`.trim() : ((dto as any).person_full_name || undefined)),
  person_email: (dto as any).person_email || undefined,
  role: dto.role,
  created_at: dto.created_at,
  updated_at: dto.updated_at,
});

export const toHospitalAssociationRequestModels = (dtos: HospitalAssociationRequestDto[]): HospitalAssociationRequestModel[] => dtos.map(toHospitalAssociationRequestModel);
