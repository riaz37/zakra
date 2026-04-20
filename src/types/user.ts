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
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface UserDetail extends User {
  roles: UserRole[];
  companies: UserCompany[];
}

export interface UserRole {
  id: string;
  name: string;
  slug: string;
  company_id: string | null;
  assigned_at: string;
}

export interface UserCompany {
  id: string;
  name: string;
  slug: string;
  is_primary: boolean;
  company_type: string | null;
  status: string | null;
  joined_at: string | null;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_type?: 'admin' | 'regular';
  company_id?: string;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AssignRolesRequest {
  role_ids: string[];
  company_id?: string;
}
