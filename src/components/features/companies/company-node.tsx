'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

import { cn } from '@/lib/utils';
import {
  NODE_WIDTH,
  STATUS_COLORS,
  type StatusColorKey,
} from './company-hierarchy.constants';
import type { CompanyFlowNode } from './company-hierarchy.utils';

const HANDLE_CLASS = '!opacity-0 !w-0 !h-0 !min-w-0 !min-h-0 !border-0';

function CompanyNodeComponent({ data, selected }: NodeProps<CompanyFlowNode>) {
  const { company, subsidiaryCount, isHighlighted } = data;
  const status = (company.status in STATUS_COLORS
    ? company.status
    : 'inactive') as StatusColorKey;
  const statusColor = STATUS_COLORS[status];
  const isSuspended = status === 'suspended';
  const isParent = subsidiaryCount > 0;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-md font-sans transition-colors duration-150',
        'bg-surface-200',
        'hover:bg-surface-300',
        isSuspended && 'bg-[rgba(232,71,106,0.06)]',
      )}
      style={{
        width: NODE_WIDTH,
        borderTop: '1px solid var(--color-border)',
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        borderLeft: `3px solid ${statusColor}`,
        boxShadow: isHighlighted
          ? `0 0 0 2px ${STATUS_COLORS.suspended}`
          : selected
            ? `0 0 0 1px ${STATUS_COLORS.active}`
            : undefined,
        outlineColor: selected ? STATUS_COLORS.active : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />

      <div className="flex flex-col gap-1 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: statusColor }}
          />
          <span
            className={cn(
              'text-body font-medium leading-tight tracking-[-0.01em] truncate',
              'text-foreground',
              isSuspended && 'opacity-65',
            )}
            title={company.name}
          >
            {company.name}
          </span>
        </div>
        <span className="text-caption text-fg-muted capitalize leading-none">
          {company.company_type === 'parent' ? 'parent company' : 'subsidiary'}
        </span>

        {isParent && (
          <>
            <div className="mt-1.5 h-px w-full bg-border" />
            <span className="text-caption text-fg-muted leading-none mt-1.5">
              <span className="mr-1 text-subtle">↳</span>
              {subsidiaryCount} {subsidiaryCount === 1 ? 'subsidiary' : 'subsidiaries'}
            </span>
          </>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </div>
  );
}

export const CompanyNode = memo(CompanyNodeComponent);
CompanyNode.displayName = 'CompanyNode';
