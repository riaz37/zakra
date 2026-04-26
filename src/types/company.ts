export interface Company {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  company_type: 'parent' | 'subsidiary';
  status: 'active' | 'inactive' | 'suspended';
  domain: string | null;
  industry: string | null;
  size: string | null;
  address: string | null;
  country: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  subsidiaries?: Company[];
  subsidiary_count?: number;
  admin_count?: number;
  user_count?: number;
}

export interface CompanyCreate {
  name: string;
  slug: string;
  description?: string;
  domain?: string;
  industry?: string;
  size?: string;
  address?: string;
  country?: string;
  settings?: Record<string, unknown>;
}

export interface CompanyUpdate {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'suspended';
  domain?: string;
  industry?: string;
  size?: string;
  address?: string;
  country?: string;
  settings?: Record<string, unknown>;
}

export interface SubsidiaryCreate {
  name: string;
  slug: string;
  description?: string;
  domain?: string;
  industry?: string;
}

export interface CompanyUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string;
  status: string;
  is_primary: boolean;
  joined_at: string;
}

export interface AddUserToCompany {
  user_id: string;
  is_primary?: boolean;
}
