'use client';

import { Edit2, Trash2, Power, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessRule } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ScopeChip({ scopeType, scopeValue }: { scopeType: string; scopeValue?: string | null }) {
  const display = scopeValue
    ? UUID_RE.test(scopeValue)
      ? scopeValue.slice(0, 8) + '…'
      : scopeValue
    : null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-[3px] bg-surface-300 px-1.5 py-0.5 font-mono text-micro uppercase tracking-[0.06em] text-muted-strong"
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

interface BusinessRuleCardProps {
  rule: BusinessRule;
  onView: (rule: BusinessRule) => void;
  onEdit: (rule: BusinessRule) => void;
  onDelete: (rule: BusinessRule) => void;
  onToggleActive: (rule: BusinessRule) => void;
}

export function BusinessRuleCard({
  rule,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: BusinessRuleCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(rule)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(rule);
        }
      }}
      className={cn(
        'cursor-pointer group relative flex flex-col rounded-lg border border-border bg-surface-200 p-5 transition-all duration-[120ms]',
        'hover:border-border-medium hover:bg-surface-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
        !rule.is_active && 'opacity-75',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors",
            rule.is_active
              ? "bg-surface-300 text-muted-strong ring-border group-hover:text-foreground"
              : "bg-surface-300 text-subtle ring-border"
          )}>
            <BookOpen size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className={cn(
              "font-sans text-subheading font-semibold tracking-tight line-clamp-1",
              rule.is_active ? "text-foreground" : "text-muted line-through"
            )}>
              {rule.name}
            </h3>
            <div className="mt-1">
              <ScopeChip scopeType={rule.scope_type} scopeValue={rule.scope_value} />
            </div>
          </div>
        </div>
        
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge 
            status={rule.is_active ? 'active' : 'inactive'} 
            label={rule.is_active ? 'Active' : 'Disabled'} 
          />
        </div>
      </div>

      {/* Body Snippet */}
      <div className="mt-4 flex-1">
        <p className={cn(
          "line-clamp-3 font-mono text-caption leading-relaxed",
          rule.is_active ? "text-muted-strong" : "text-subtle"
        )}>
          {rule.rule_text}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 gap-1.5 px-3"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleActive(rule);
          }}
        >
          <Power aria-hidden size={14} strokeWidth={2} className={rule.is_active ? "text-muted-strong" : "text-success"} />
          <span className="text-muted-strong">{rule.is_active ? 'Disable' : 'Enable'}</span>
        </Button>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(rule);
            }}
            aria-label={`Edit ${rule.name}`}
          >
            <Edit2 size={14} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted hover:text-error"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(rule);
            }}
            aria-label={`Delete ${rule.name}`}
          >
            <Trash2 size={14} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
