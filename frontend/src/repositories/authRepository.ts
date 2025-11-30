// Generated: Auth feature — follow DI + repository + zustand factory pattern

import { authService } from '../api/authService';
import type { AuthDto, AuthModel, LoginPayload, SignupPayload } from '../models/auth';

/**
 * Transform DTO to app model
 */
function transformDtoToModel(dto: AuthDto): AuthModel {
  return {
    token: dto.token,
    refreshToken: dto.refreshToken,
    user: {
      ...dto.user,
      fullName: `${dto.user.firstName} ${dto.user.lastName}`,
      createdAt: new Date(dto.user.createdAt),
      updatedAt: new Date(dto.user.updatedAt),
    },
  };
}

/**
 * Validate login payload
 */
function validateLoginPayload(payload: LoginPayload): void {
  if (!payload.email || !payload.email.includes('@')) {
    throw new Error('Valid email is required');
  }
  if (!payload.password || payload.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
}

/**
 * Validate signup payload
 */
function validateSignupPayload(payload: SignupPayload): void {
  if (!payload.email || !payload.email.includes('@')) {
    throw new Error('Valid email is required');
  }
  if (!payload.password || payload.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  if (!payload.firstName || payload.firstName.trim().length === 0) {
    throw new Error('First name is required');
  }
  if (!payload.lastName || payload.lastName.trim().length === 0) {
    throw new Error('Last name is required');
  }
  if (!['doctor', 'patient', 'admin'].includes(payload.role)) {
    throw new Error('Valid role is required');
  }
}

/**
 * Auth repository factory - converts DTO → app model and enforces business rules
 */
export function createAuthRepository(dependencies = { authService }) {
  const service = dependencies.authService;

  return {
    /**
     * Login user with email and password
     */
    async login(payload: LoginPayload): Promise<AuthModel> {
      validateLoginPayload(payload);
      const dto = await service.login(payload);
      return transformDtoToModel(dto);
    },

    /**
     * Register new user account
     */
    async signup(payload: SignupPayload): Promise<AuthModel> {
      validateSignupPayload(payload);
      const dto = await service.signup(payload);
      return transformDtoToModel(dto);
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
      await service.logout();
    },

    /**
     * Verify current token
     */
    async verifyToken(): Promise<AuthModel> {
      const dto = await service.verifyToken();
      return transformDtoToModel(dto);
    },

    /**
     * Refresh authentication token
     */
    async refreshToken(refreshToken: string): Promise<AuthModel> {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }
      const dto = await service.refreshToken(refreshToken);
      return transformDtoToModel(dto);
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;
