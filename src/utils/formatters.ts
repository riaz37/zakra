/**
 * Utility functions for formatting data
 */

/**
 * Format a date string to a localized date
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string to a localized date and time
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

  return formatDate(dateString);
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('en-US');
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string | null | undefined, maxLength: number): string {
  if (!str) return '-';
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Format a user's full name
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '-';
}

/**
 * Generate initials from a name
 */
export function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}

/**
 * Format database type for display
 */
export function formatDatabaseType(type: string): string {
  const types: Record<string, string> = {
    postgresql: 'PostgreSQL',
    mssql: 'MS SQL Server',
    mongodb: 'MongoDB',
  };
  return types[type] || type;
}

/**
 * Format company type for display
 */
export function formatCompanyType(type: string): string {
  const types: Record<string, string> = {
    parent: 'Parent Company',
    subsidiary: 'Subsidiary',
  };
  return types[type] || type;
}

/**
 * Format user type for display
 */
export function formatUserType(type: string): string {
  const types: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    regular: 'User',
  };
  return types[type] || type;
}

/**
 * Format status with proper casing
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
