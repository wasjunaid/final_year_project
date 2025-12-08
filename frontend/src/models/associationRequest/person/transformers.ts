import type { PersonAssociationRequestDto } from './dto';
import type { PersonAssociationRequestModel } from './model';

export const toPersonAssociationRequestModel = (dto: PersonAssociationRequestDto): PersonAssociationRequestModel => ({
  hospital_association_request_id: dto.hospital_association_request_id,
  hospital_id: dto.hospital_id,
  person_id: dto.person_id,
  person_name: (dto as any).person_name || (((dto as any).person_first_name || (dto as any).person_last_name) ? `${((dto as any).person_first_name || '').trim()} ${((dto as any).person_last_name || '').trim()}`.trim() : ((dto as any).person_full_name || undefined)),
  person_email: (dto as any).person_email || undefined,
  role: dto.role,
  created_at: dto.created_at,
  updated_at: dto.updated_at,
});

export const toPersonAssociationRequestModels = (dtos: PersonAssociationRequestDto[]): PersonAssociationRequestModel[] => dtos.map(toPersonAssociationRequestModel);
