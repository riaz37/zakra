export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  company_id: string | null;
  role_type: 'system' | 'company_default' | 'custom';
  hierarchy_level: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  resource_type: string;
  action: string;
  name: string;
  description: string | null;
  module: string;
  is_system: boolean;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface RoleCreate {
  name: string;
  slug: string;
  description?: string;
  company_id?: string;
  hierarchy_level?: number;
  is_default?: boolean;
}

export interface RoleUpdate {
  name?: string;
  description?: string;
  hierarchy_level?: number;
  is_default?: boolean;
}

export interface SetRolePermissions {
  permission_ids: string[];
}

export interface PermissionListResponse {
  items: Permission[];
  total: number;
  modules: string[];
}
