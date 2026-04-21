/**
 * Shared display helpers for user-shaped records.
 *
 * Anything that has at minimum `email`, plus optional `first_name` and
 * `last_name`, satisfies `Nameable` and can be passed to these utilities.
 * Used across the admin Users page, drawers, dialogs, and any future surface
 * that needs to render an avatar initial, a friendly label, or a relative
 * "last seen" timestamp.
 */

export interface Nameable {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

/**
 * Returns up to two uppercase initials from a user's first/last name.
 * Falls back to the first character of the email, then "U", so we always
 * render *something* in an avatar tile.
 */
export function initialsFor(u: Nameable): string {
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  return (f + l || u.email[0] || "U").toUpperCase();
}

/**
 * Renders a user's preferred display name. Combines first + last when present,
 * otherwise falls back to the local-part of their email so we never show a raw
 * `null null`.
 */
export function displayName(u: Nameable): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return full || u.email.split("@")[0];
}

/**
 * Formats an ISO timestamp as a short relative string (e.g. "5m ago", "2d ago").
 * Anything older than 30 days falls back to a localized date. Returns "—" when
 * the input is null so empty cells stay aligned with surrounding rows.
 */
export function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}
