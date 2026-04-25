import type { Role } from '@/types';
import { cn } from '@/lib/utils';

interface RoleTypeBadgeProps {
  type: Role['role_type'];
}

const VARIANTS: Record<Role['role_type'], { label: string; classes: string }> = {
  system: {
    label: 'System',
    classes:
      'bg-[rgba(106,158,196,0.14)] text-read border border-[rgba(106,158,196,0.22)]',
  },
  company_default: {
    label: 'Company Default',
    classes:
      'bg-[rgba(62,207,142,0.12)] text-accent border border-[rgba(62,207,142,0.2)]',
  },
  custom: {
    label: 'Custom',
    classes: 'bg-surface-300 text-muted border border-border',
  },
};

export function RoleTypeBadge({ type }: RoleTypeBadgeProps) {
  const variant = VARIANTS[type] ?? VARIANTS.custom;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-sans text-caption font-medium leading-none',
        variant.classes,
      )}
    >
      {variant.label}
    </span>
  );
}
