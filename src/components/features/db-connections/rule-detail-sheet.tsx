'use client';

import { Pencil, Trash2 } from 'lucide-react';

import type { BusinessRule } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ScopeChip({ scopeType, scopeValue }: { scopeType: string; scopeValue?: string | null }) {
  const display = scopeValue
    ? UUID_RE.test(scopeValue)
      ? scopeValue.slice(0, 8) + '…'
      : scopeValue
    : null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-[3px] bg-surface-300 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-strong"
      title={scopeValue ?? undefined}
    >
      {scopeType}
      {display ? (
        <>
          <span className="text-subtle">·</span>
          <span className="normal-case text-muted">{display}</span>
        </>
      ) : null}
    </span>
  );
}

interface RuleDetailSheetProps {
  rule: BusinessRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (rule: BusinessRule) => void;
  onDelete: (rule: BusinessRule) => void;
}

export function RuleDetailSheet({
  rule,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: RuleDetailSheetProps) {
  if (!rule) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        showCloseButton
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <SheetTitle
                className={cn(
                  'truncate font-sans text-base font-semibold tracking-[-0.01em]',
                  !rule.is_active && 'text-muted line-through',
                )}
              >
                {rule.name}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <ScopeChip scopeType={rule.scope_type} scopeValue={rule.scope_value} />
                {!rule.is_active && (
                  <span className="font-sans text-caption text-subtle">Disabled</span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Rule text body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <pre
            className={cn(
              'whitespace-pre-wrap break-words font-mono text-mono-sm leading-relaxed',
              rule.is_active ? 'text-foreground' : 'text-muted',
            )}
          >
            {rule.rule_text}
          </pre>
        </div>

        <SheetFooter className="border-t border-border px-5 py-4">
          <div className="flex w-full items-center justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDelete(rule);
              }}
            >
              <Trash2 aria-hidden size={13} strokeWidth={1.75} />
              Delete rule
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(rule);
              }}
            >
              <Pencil aria-hidden size={13} strokeWidth={1.75} />
              Edit rule
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
