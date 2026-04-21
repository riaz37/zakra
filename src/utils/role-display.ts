/**
 * Display helpers for role/permission records.
 */

export function humanizeModule(m: string): string {
  return m.charAt(0).toUpperCase() + m.slice(1).replace(/[_-]/g, " ");
}
