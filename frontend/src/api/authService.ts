// Generated: Auth feature — follow DI + repository + zustand factory pattern

// import apiClient from './apiClient'; // TODO: Uncomment when ready to use real API
import type { AuthDto, LoginPayload, SignupPayload } from '../models/auth';

/**
 * Auth service - pure HTTP helpers returning DTOs (no UI logic)
 * Currently using MOCK data - replace with actual API calls when backend is ready
 */
export const authService = {
  /**
   * Login user and get authentication token
   * MOCK: Replace with actual API call when backend is ready
   */
  async login(payload: LoginPayload): Promise<AuthDto> {
    // TODO: Replace mock with actual API call
    // const response = await apiClient.post<AuthDto>('/auth/login', payload);
    // return response.data;
    
    // Mock response for development
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const mockDto: AuthDto = {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        email: payload.email,
        role: payload.role, // Use the role from the login payload
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    
    return mockDto;
  },

  /**
   * Register new user account
   * MOCK: Replace with actual API call when backend is ready
   */
  async signup(payload: SignupPayload): Promise<AuthDto> {
    // TODO: Replace mock with actual API call
    // const response = await apiClient.post<AuthDto>('/auth/signup', payload);
    // return response.data;
    
    // Mock response for development
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const mockDto: AuthDto = {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    
    return mockDto;
  },

  /**
   * Logout user (optional backend call)
   * MOCK: Replace with actual API call when backend is ready
   */
  async logout(): Promise<void> {
    // TODO: Replace mock with actual API call
    // await apiClient.post('/auth/logout');
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
  },

  /**
   * Verify current token and get user data
   * MOCK: Replace with actual API call when backend is ready
   */
  async verifyToken(): Promise<AuthDto> {
    // TODO: Replace mock with actual API call
    // const response = await apiClient.get<AuthDto>('/auth/verify');
    // return response.data;
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    const mockDto: AuthDto = {
      token,
      user: {
        id: 'user-123',
        email: 'user@example.com',
        role: 'doctor',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    
    return mockDto;
  },

  /**
   * Refresh authentication token
   * MOCK: Replace with actual API call when backend is ready
   */
  async refreshToken(refreshToken: string): Promise<AuthDto> {
    // TODO: Replace mock with actual API call
    // const response = await apiClient.post<AuthDto>('/auth/refresh', { refreshToken });
    // return response.data;
    
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    const mockDto: AuthDto = {
      token: 'new-mock-jwt-token-' + Date.now(),
      refreshToken: 'new-mock-refresh-token-' + Date.now(),
      user: {
        id: 'user-123',
        email: 'user@example.com',
        role: 'doctor',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    
    return mockDto;
  },
};
