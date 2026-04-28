'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RowActionsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  editLabel?: string;
  deleteLabel?: string;
  disableEdit?: boolean;
  disableDelete?: boolean;
  variant?: 'ghost-icon' | 'outline-icon';
}

export function RowActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  disableEdit,
  disableDelete,
  variant = 'ghost-icon',
}: RowActionsProps) {
  if (variant === 'outline-icon') {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onEdit}
          disabled={disableEdit}
          aria-label={editLabel ?? 'Edit'}
          className="h-8 w-8"
        >
          <Pencil aria-hidden size={14} strokeWidth={1.75} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onDelete}
          disabled={disableDelete}
          aria-label={deleteLabel ?? 'Delete'}
          className="h-8 w-8 hover:text-error hover:border-error/50"
        >
          <Trash2 aria-hidden size={14} strokeWidth={1.75} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onEdit}
        disabled={disableEdit}
        aria-label={editLabel ?? 'Edit'}
      >
        <Pencil aria-hidden size={13} strokeWidth={1.75} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        disabled={disableDelete}
        aria-label={deleteLabel ?? 'Delete'}
        className="hover:text-error"
      >
        <Trash2 aria-hidden size={13} strokeWidth={1.75} />
      </Button>
    </div>
  );
}
