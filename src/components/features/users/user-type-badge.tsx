import { cn } from '@/lib/utils';

interface UserTypeBadgeProps {
  type: string;
}

const VARIANTS: Record<string, { label: string; classes: string }> = {
  super_admin: {
    label: 'Super Admin',
    classes: 'bg-warning-bg text-gold border border-warning-border',
  },
  admin: {
    label: 'Admin',
    classes: 'bg-accent-bg text-accent border border-accent-border',
  },
  regular: {
    label: 'Regular',
    classes: 'bg-surface-300 text-muted border border-border',
  },
};

export function UserTypeBadge({ type }: UserTypeBadgeProps) {
  const variant = VARIANTS[type] ?? VARIANTS.regular;

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
