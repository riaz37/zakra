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
