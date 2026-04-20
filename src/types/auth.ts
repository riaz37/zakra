export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  user_type: 'super_admin' | 'admin' | 'regular';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  mode: 'b2b' | 'b2c';
  email_verified: boolean;
  company_id: string | null;
  company_type: 'parent' | 'subsidiary' | null;
  roles: string[];
  permissions: string[];
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export type AuthStore = AuthState & AuthActions;
