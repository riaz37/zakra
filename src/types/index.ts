export * from './auth';
export * from './company';
export type { ListUser, UserDetail, UserRole, UserCompany, UserCreate, UserUpdate, AssignRolesRequest } from './user';
export * from './role';
export * from './db-connection';
export * from './table-access';
export * from './db-query';
export * from './report';

// Common types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit?: number;
  skip?: number;
  // These fields are not returned by the API — computed locally where needed
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
  errors?: Record<string, string[]>;
}

export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}
