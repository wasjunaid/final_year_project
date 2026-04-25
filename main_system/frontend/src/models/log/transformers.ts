import type { LogDto } from './dto';
import type { LogModel } from './model';

// Transform Log DTO to Model
export const toLogModel = (dto: LogDto): LogModel => {
  // Compute user name from first_name and last_name
  let user_name = 'Unknown User';
  if (dto.first_name && dto.last_name) {
    user_name = `${dto.first_name} ${dto.last_name}`;
  } else if (dto.first_name) {
    user_name = dto.first_name;
  } else if (dto.last_name) {
    user_name = dto.last_name;
  } else if (dto.email) {
    user_name = dto.email;
  }

  return {
    log_id: dto.log_id,
    person_id: dto.person_id,
    action: dto.action,
    created_at: dto.created_at,
    first_name: dto.first_name,
    last_name: dto.last_name,
    email: dto.email,
    user_name,
  };
};

// Transform array of Log DTOs to array of Models
export const toLogModels = (dtos: LogDto[]): LogModel[] => {
  return dtos.map(toLogModel);
};
