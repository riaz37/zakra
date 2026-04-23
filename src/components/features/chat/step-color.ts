export function stepColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('think') || lower.includes('plan') || lower.includes('reason')) {
    return 'var(--color-thinking)';
  }
  if (lower.includes('search') || lower.includes('grep') || lower.includes('find')) {
    return 'var(--color-grep)';
  }
  if (lower.includes('read') || lower.includes('query') || lower.includes('fetch')) {
    return 'var(--color-read)';
  }
  if (lower.includes('write') || lower.includes('edit') || lower.includes('generat')) {
    return 'var(--color-edit)';
  }
  return 'var(--color-thinking)';
}
