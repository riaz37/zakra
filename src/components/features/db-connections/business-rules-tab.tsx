'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, Plus } from 'lucide-react';

import {
  useBusinessRules,
  useDeleteBusinessRule,
  useUpdateBusinessRule,
} from '@/hooks/useBusinessRules';
import type { BusinessRule } from '@/types';
import { Button } from '@/components/ui/button';

import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { RuleDialog } from './rule-dialog';
import { RuleDetailSheet } from './rule-detail-sheet';
import { BusinessRuleCard } from './business-rule-card';

interface BusinessRulesTabProps {
  connectionId: string;
  companyId?: string;
}

export function BusinessRulesTab({
  connectionId,
  companyId,
}: BusinessRulesTabProps) {
  const { data, isLoading, isError, refetch } = useBusinessRules(
    connectionId,
    undefined,
    companyId,
  );
  const deleteRule = useDeleteBusinessRule(connectionId, companyId);
  const updateRule = useUpdateBusinessRule(connectionId, companyId);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessRule | null>(null);
  const [viewingRule, setViewingRule] = useState<BusinessRule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const rules: BusinessRule[] = data?.rules ?? [];

  function handleAdd() {
    setEditingRule(null);
    setRuleDialogOpen(true);
  }

  function handleView(rule: BusinessRule) {
    setViewingRule(rule);
    setDetailOpen(true);
  }

  function handleEdit(rule: BusinessRule) {
    setEditingRule(rule);
    setRuleDialogOpen(true);
  }

  function handleDialogChange(next: boolean) {
    setRuleDialogOpen(next);
    if (!next) setEditingRule(null);
  }

  async function handleToggleActive(rule: BusinessRule) {
    try {
      await updateRule.mutateAsync({ ruleId: rule.id, data: { is_active: !rule.is_active } });
      toast.success(rule.is_active ? 'Rule disabled' : 'Rule enabled');
    } catch {
      toast.error('Could not update rule. Please try again.');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRule.mutateAsync(deleteTarget.id);
      toast.success('Business rule deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Could not delete rule. Please try again.');
    }
  }

  // No longer using getRulesColumns

  const showEmpty = !isLoading && !isError && rules.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={handleAdd}>
          <Plus aria-hidden size={14} strokeWidth={2} />
          Add rule
        </Button>
      </div>

      {isError ? (
        <ErrorState
          title="Failed to load rules"
          description="There was a problem loading business rules for this connection."
          onRetry={() => refetch()}
        />
      ) : showEmpty ? (
        <EmptyState
          icon={BookOpen}
          title="No business rules yet"
          description="Add your first rule to guide AI query generation. Rules help the model understand domain-specific terminology and constraints."
          primaryAction={{ label: 'Add rule', onClick: handleAdd }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rules.map((rule) => (
            <BusinessRuleCard
              key={rule.id}
              rule={rule}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={(r) => setDeleteTarget(r)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <RuleDetailSheet
        rule={viewingRule}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(rule) => {
          setDetailOpen(false);
          handleEdit(rule);
        }}
        onDelete={(rule) => {
          setDetailOpen(false);
          setDeleteTarget(rule);
        }}
      />

      <RuleDialog
        open={ruleDialogOpen}
        onOpenChange={handleDialogChange}
        connectionId={connectionId}
        companyId={companyId}
        editingRule={editingRule}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete rule"
        description={`This will permanently remove "${deleteTarget?.name ?? ''}". This action cannot be undone.`}
        confirmLabel="Delete rule"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteRule.isPending}
      />
    </div>
  );
}
