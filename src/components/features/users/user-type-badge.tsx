import { cn } from '@/lib/utils';

interface UserTypeBadgeProps {
  type: string;
}

const VARIANTS: Record<string, { label: string; classes: string }> = {
  super_admin: {
    label: 'Super Admin',
    classes:
      'bg-[rgba(229,165,10,0.12)] text-gold border border-[rgba(229,165,10,0.2)]',
  },
  admin: {
    label: 'Admin',
    classes:
      'bg-[rgba(62,207,142,0.12)] text-accent border border-[rgba(62,207,142,0.2)]',
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
        'inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[11px] font-medium leading-none',
        variant.classes,
      )}
    >
      {variant.label}
    </span>
  );
}
