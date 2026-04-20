import api from './axios';
import type { LoginRequest, LoginResponse, User } from '../types';

/**
 * Authentication API client
 */

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

/**
 * Get the current authenticated user's profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

/**
 * Refresh the access token
 */
export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
}
