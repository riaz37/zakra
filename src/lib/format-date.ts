/**
 * Format an ISO date string to a human-readable date.
 * Example: "2024-03-15T10:30:00Z" → "Mar 15, 2024"
 */
export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString));
}

/**
 * Format an ISO date string to a human-readable date + time.
 * Example: "2024-03-15T10:30:00Z" → "Mar 15, 2024, 10:30 AM"
 */
export function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

/**
 * Format an ISO datetime string to a human-readable date + time with seconds.
 * Example: "2022-05-19T08:11:32.947000" → "May 19, 2022, 08:11:32"
 */
export function formatDateTimeSeconds(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(isoString));
}

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Detect and format ISO date/datetime strings from query result cells.
 * Returns null if the value is not a recognisable date string.
 */
export function tryFormatQueryDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (ISO_DATETIME_RE.test(value)) {
    try {
      return formatDateTimeSeconds(value);
    } catch {
      return null;
    }
  }
  if (ISO_DATE_RE.test(value)) {
    try {
      return formatDate(value + 'T00:00:00');
    } catch {
      return null;
    }
  }
  return null;
}
