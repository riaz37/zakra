export function stepColor(name: string): string {
  const lower = name.toLowerCase();
  if (
    lower.includes('think') ||
    lower.includes('plan') ||
    lower.includes('reason') ||
    lower.includes('routing') ||
    lower.includes('route')
  ) {
    return 'var(--color-thinking)';
  }
  if (
    lower.includes('search') ||
    lower.includes('grep') ||
    lower.includes('find') ||
    lower.includes('business') ||
    lower.includes('rule') ||
    lower.includes('select')
  ) {
    return 'var(--color-grep)';
  }
  if (
    lower.includes('query') ||
    lower.includes('fetch') ||
    lower.includes('table') ||
    lower.includes('execution') ||
    lower.includes('execute') ||
    lower.includes('tool')
  ) {
    return 'var(--color-read)';
  }
  if (lower.includes('read')) {
    return 'var(--color-read)';
  }
  if (
    lower.includes('write') ||
    lower.includes('edit') ||
    lower.includes('generat') ||
    lower.includes('step') ||
    lower.includes('process')
  ) {
    return 'var(--color-edit)';
  }
  return 'var(--color-thinking)';
}
