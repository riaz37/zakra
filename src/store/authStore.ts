import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, AuthActions, User, LoginRequest } from '../types';
import * as authApi from '../api/auth';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api/axios';

type AuthStore = AuthState & AuthActions;

/**
 * Zustand store for authentication state management
 * Persists user data to localStorage
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login with email and password
       */
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(credentials);
          setTokens(response.access_token, response.refresh_token);

          const cookieRes = await fetch('/api/auth/set-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: response.access_token,
              refresh_token: response.refresh_token,
            }),
          });

          if (!cookieRes.ok) {
            clearTokens();
            throw new Error('Session setup failed');
          }

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Login failed. Please try again.';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Logout the current user
       */
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Continue with logout even if API call fails
        } finally {
          clearTokens();
          await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {});
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      /**
       * Fetch the current user profile
       */
      fetchUser: async () => {
        const token = getAccessToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      /**
       * Refresh the access token
       */
      refreshToken: async () => {
        const refreshTokenValue = getRefreshToken();
        if (!refreshTokenValue) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authApi.refreshToken(refreshTokenValue);
          setTokens(response.access_token, response.refresh_token);

          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch (error) {
          clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            error: 'Session expired. Please login again.',
          });
          throw error;
        }
      },

      /**
       * Clear any authentication errors
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Update user data (for profile updates)
       */
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Hook to get authentication helpers
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, logout, fetchUser, clearError } =
    useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    fetchUser,
    clearError,
    isSuperAdmin: user?.user_type === 'super_admin',
    isAdmin: user?.user_type === 'admin' || user?.user_type === 'super_admin',
  };
}
