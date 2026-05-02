export type ColumnPermission = 'none' | 'read' | 'read_masked' | 'write';
export type MaskPattern = 'EMAIL' | 'PHONE' | 'SSN' | 'PARTIAL' | 'FULL';

export interface ManagedTable {
  id: string;
  company_id: string | null;
  schema_name: string;
  table_name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  columns: ManagedColumn[];
  created_at: string;
  updated_at: string;
}

export interface ManagedColumn {
  name: string;
  data_type: string;
  is_nullable: boolean;
  description: string | null;
}

export interface ColumnPermissionGrant {
  id: string;
  table_id: string;
  column_name: string;
  grantee_type: 'user' | 'role';
  grantee_id: string;
  permission: ColumnPermission;
  mask_pattern: MaskPattern | null;
  row_filter: string | null;
  granted_by_id: string;
  granted_at: string;
}

export interface GrantColumnPermission {
  column_name: string;
  grantee_type: 'user' | 'role';
  grantee_id: string;
  permission: ColumnPermission;
  mask_pattern?: MaskPattern;
  row_filter?: string;
}

export interface BulkGrantPermissions {
  grantee_type: 'user' | 'role';
  grantee_id: string;
  permissions: Record<string, string>;
}

export interface UserTablePermissions {
  table_id: string;
  table_name: string;
  schema_name: string;
  display_name?: string;
  columns: UserColumnPermission[];
}

export interface UserColumnPermission {
  column_name: string;
  permission: ColumnPermission;
  grantee_type: 'user' | 'role';
  mask_pattern?: MaskPattern | null;
}

export interface RegisterTableRequest {
  schema_name: string;
  table_name: string;
  display_name?: string;
  description?: string;
  company_id?: string;
}
