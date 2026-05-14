export interface Company {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  company_type: 'parent' | 'subsidiary';
  status: 'active' | 'inactive' | 'suspended';
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  subsidiaries?: Company[];
  subsidiary_count?: number;
}

export interface CompanyCreate {
  name: string;
  slug?: string | null;
  settings?: Record<string, unknown> | null;
}

export interface CompanyUpdate {
  name?: string | null;
  slug?: string | null;
  status?: 'active' | 'inactive' | 'suspended' | null;
  settings?: Record<string, unknown> | null;
}

export interface SubsidiaryCreate {
  name: string;
  slug?: string | null;
  settings?: Record<string, unknown> | null;
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
