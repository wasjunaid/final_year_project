import type { AuthModel, UserModel } from './model';
import type { AuthDto, PersonDto } from './dto';
import { decodeJWTPayload } from '../../utils/decodeJWTPayload';

// Transform AuthDto to AuthModel by decoding JWT
export function transformAuthDto(dto: AuthDto): AuthModel {
  const payload = decodeJWTPayload(dto.accessToken);
  
  if (!payload || !payload.role || !payload.person_id) {
    throw new Error('Invalid token: Failed to decode authentication information');
  }
  
  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
    role: payload.role,
    personId: payload.person_id,
  };
}

// Transform PersonDto to UserModel with computed fields
export function transformPersonDto(dto: PersonDto): UserModel {
  // Compute full name or fall back to email
  const fullName = dto.first_name && dto.last_name
    ? `${dto.first_name} ${dto.last_name}`
    : dto.first_name || dto.last_name || dto.email;

  // Compute age from date of birth
  let age: number | null = null;
  if (dto.date_of_birth) {
    const birthDate = new Date(dto.date_of_birth);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  return {
    id: dto.person_id,
    email: dto.email,
    firstName: dto.first_name,
    lastName: dto.last_name,
    fullName,
    cnic: dto.cnic,
    dateOfBirth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
    age,
    gender: dto.gender,
    isVerified: dto.is_verified,
    isProfileComplete: dto.is_person_profile_complete,
    profilePictureUrl: dto.profile_picture_url,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
