/**
 * Display helpers for user-shaped records (admin pages).
 *
 * Used by /users and /companies. Connections cards keep their own
 * formatRelative because the copy ("never", "just now") is route-specific.
 */

export type Nameable = {
  first_name: string | null;
  last_name: string | null;
  email: string;
};

export function initialsFor(u: Nameable): string {
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  const fallback = u.email[0] ?? "U";
  return ((f + l) || fallback).toUpperCase();
}

export function displayName(u: Nameable): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return full || u.email.split("@")[0];
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}
