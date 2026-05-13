/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// App Configuration
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Zakra Admin';

// Authentication
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const TOKEN_EXPIRY_BUFFER_MS = 60000; // 1 minute buffer before token expiry

// UI density preference (settings page)
export const DENSITY_STORAGE_KEY = 'zakra-density';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [11, 25, 50, 100];

// User Types
export const USER_TYPES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  REGULAR: 'regular',
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

// Company Types
export const COMPANY_TYPES = {
  PARENT: 'parent',
  SUBSIDIARY: 'subsidiary',
} as const;

// Company Status
export const COMPANY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

// Database Types
export const DATABASE_TYPES = {
  MSSQL: 'mssql',
} as const;

// Column Permissions
export const COLUMN_PERMISSIONS = {
  NONE: 'none',
  READ: 'read',
  READ_MASKED: 'read_masked',
  WRITE: 'write',
} as const;

// Mask Patterns
export const MASK_PATTERNS = {
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  SSN: 'SSN',
  PARTIAL: 'PARTIAL',
  FULL: 'FULL',
} as const;

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/overview',
  COMPANIES: '/companies',
  COMPANY_DETAIL: '/companies/:id',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  ROLES: '/roles',
  DB_CONNECTIONS: '/db-connections',
  DB_CONNECTION_DETAIL: '/db-connections/:id',
  TABLE_ACCESS: '/table-access',
  REPORT_TEMPLATES: '/reports/templates',
  REPORT_TEMPLATE_NEW: '/reports/templates/new',
  REPORT_TEMPLATE_DETAIL: '/reports/templates/:id',
  REPORT_AI_GENERATE: '/reports/ai-generate',
  REPORT_GENERATE: '/reports/generate/:templateId',
  REPORT_VIEW: '/reports/:reportId',
  CHAT: '/chat',
  CHAT_SESSION: '/chat/:sessionId',
  NOT_FOUND: '*',
} as const;

export type RequiredRole = 'admin' | 'super_admin';

// Navigation Items — Overview is the home (/); admin-only items gated by requiredRole
export const NAV_ITEMS = [
  { label: 'Overview', path: ROUTES.DASHBOARD, icon: 'Gauge' },
  { label: 'Chat', path: ROUTES.CHAT, icon: 'Bot' },
  { label: 'Reports', path: ROUTES.REPORT_AI_GENERATE, icon: 'ScrollText' },
  { label: 'Companies', path: ROUTES.COMPANIES, icon: 'Landmark', requiredRole: 'admin' as RequiredRole },
  { label: 'Users', path: ROUTES.USERS, icon: 'Contact', requiredRole: 'admin' as RequiredRole },
  { label: 'Databases', path: ROUTES.DB_CONNECTIONS, icon: 'Server', requiredRole: 'admin' as RequiredRole },
  { label: 'Table Access', path: ROUTES.TABLE_ACCESS, icon: 'TableProperties', requiredRole: 'admin' as RequiredRole },
] as const;
