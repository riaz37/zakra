'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { Check, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'onCheckedChange'> & {
  onCheckedChange?: (checked: boolean) => void;
};

function Checkbox({
  className,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      onCheckedChange={onCheckedChange}
      className={cn(
        'group/checkbox relative inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border-medium bg-surface-200 transition-[background,border-color] outline-none',
        'hover:border-fg-muted',
        'focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent',
        'data-[checked]:bg-accent data-[checked]:border-accent',
        'data-[indeterminate]:bg-accent data-[indeterminate]:border-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex items-center justify-center text-[var(--color-background)]"
        render={
          <span>
            <Check
              aria-hidden
              className="size-3 hidden group-data-[checked]/checkbox:block"
              strokeWidth={3}
            />
            <Minus
              aria-hidden
              className="size-3 hidden group-data-[indeterminate]/checkbox:block"
              strokeWidth={3}
            />
          </span>
        }
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
