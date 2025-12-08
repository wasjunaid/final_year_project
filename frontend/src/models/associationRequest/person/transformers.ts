import type { PersonAssociationRequestDto } from './dto';
import type { PersonAssociationRequestModel } from './model';

export const toPersonAssociationRequestModel = (dto: PersonAssociationRequestDto): PersonAssociationRequestModel => ({
  hospital_association_request_id: dto.hospital_association_request_id,
  hospital_id: dto.hospital_id,
  hospitalName: (dto as any).hospital_name || undefined,
  created_at: dto.created_at,
  updated_at: dto.updated_at,
});

export const toPersonAssociationRequestModels = (dtos: PersonAssociationRequestDto[]): PersonAssociationRequestModel[] => dtos.map(toPersonAssociationRequestModel);
