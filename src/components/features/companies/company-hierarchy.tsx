'use client';

import '@xyflow/react/dist/style.css';

import { useCallback, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
} from '@xyflow/react';
import { AlertTriangle, Building2, GitBranch, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { useCompanyTree } from '@/hooks/useCompanyTree';
import {
  useCreateCompany,
  useCreateSubsidiary,
} from '@/hooks/useCompanies';
import { CompanyNode } from '@/components/features/companies/company-node';
import { CompanyPopover } from '@/components/features/companies/company-popover';
import {
  CompanyForm,
  type CompanyFormData,
} from '@/components/features/companies/company-form';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/shared/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import { NODE_TYPE } from '@/components/features/companies/company-hierarchy.constants';
import type { CompanyFlowNode } from '@/components/features/companies/company-hierarchy.utils';
import type {
  Company,
  CompanyCreate,
  SubsidiaryCreate,
} from '@/types';

const nodeTypes: NodeTypes = {
  [NODE_TYPE]: CompanyNode,
};

const edgeTypes: EdgeTypes = {};

const FIT_VIEW_OPTIONS = { padding: 0.22, duration: 240 } as const;

function CompanyHierarchyInner() {
  const { nodes, edges, summary, items, isLoading, isError, refetch } = useCompanyTree();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addSubsidiaryFor, setAddSubsidiaryFor] = useState<Company | null>(null);
  const [highlightSuspended, setHighlightSuspended] = useState(false);

  const createMutation = useCreateCompany();
  const subsidiaryMutation = useCreateSubsidiary(addSubsidiaryFor?.id ?? '');

  const styledNodes = useMemo<CompanyFlowNode[]>(
    () =>
      nodes.map((node) => {
        const isSuspendedNode = node.data.company.status === 'suspended';
        const isSelected = node.id === selectedId;
        return {
          ...node,
          selected: isSelected,
          data: {
            ...node.data,
            isHighlighted: highlightSuspended && isSuspendedNode,
          },
        };
      }),
    [nodes, highlightSuspended, selectedId],
  );

  const styledEdges = useMemo<Edge[]>(() => {
    const suspendedIds = new Set(
      items.filter((c) => c.status === 'suspended').map((c) => c.id),
    );

    return edges.map((edge) => {
      const touchesSuspended =
        suspendedIds.has(edge.source) || suspendedIds.has(edge.target);
      return {
        ...edge,
        animated: false,
        style: touchesSuspended
          ? { stroke: 'rgba(232, 71, 106, 0.34)', strokeDasharray: '4 4' }
          : { stroke: 'rgba(235, 234, 229, 0.16)' },
      };
    });
  }, [edges, items]);

  const selectedCompany = useMemo(
    () => (selectedId ? items.find((c) => c.id === selectedId) ?? null : null),
    [selectedId, items],
  );

  const handleNodeClick = useCallback(
    (_event: unknown, node: { id: string }) => {
      setSelectedId((prev) => (prev === node.id ? null : node.id));
    },
    [],
  );

  const closeDetail = useCallback(() => setSelectedId(null), []);

  const handleAddSubsidiary = useCallback((parent: Company) => {
    setAddSubsidiaryFor(parent);
    setSelectedId(null);
  }, []);

  const closeAddSubsidiary = useCallback(() => {
    if (subsidiaryMutation.isPending || createMutation.isPending) return;
    setAddSubsidiaryFor(null);
  }, [subsidiaryMutation.isPending, createMutation.isPending]);

  async function handleCreateSubsidiary(formData: CompanyFormData) {
    if (!addSubsidiaryFor) return;

    const payload: SubsidiaryCreate = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
    };

    try {
      await subsidiaryMutation.mutateAsync(payload);
      toast.success(`Added ${formData.name} under ${addSubsidiaryFor.name}`);
      setAddSubsidiaryFor(null);
    } catch (error) {
      // Fallback to flat create if the parent already supports subsidiary endpoint shape mismatch.
      const fallback: CompanyCreate = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
      };
      try {
        await createMutation.mutateAsync({
          data: fallback,
          parentId: addSubsidiaryFor.id,
        });
        toast.success(`Added ${formData.name}`);
        setAddSubsidiaryFor(null);
      } catch {
        toast.error(error instanceof Error ? error.message : 'Could not add subsidiary');
      }
    }
  }

  if (isLoading) {
    return <HierarchySkeleton />;
  }

  if (isError) {
    return (
      <div className="px-6 py-8">
        <ErrorState title="Failed to load hierarchy" onRetry={refetch} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No hierarchy to show"
        description="Create your first parent company to start mapping the organisation."
      />
    );
  }


  return (
    <div
      className="flex flex-col rounded-lg border border-border overflow-hidden bg-surface-200/40"
      style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}
    >
      <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-surface-200/60 shrink-0">
        <div className="flex items-center gap-2 font-sans text-caption text-muted">
          <Building2 aria-hidden size={13} strokeWidth={1.75} className="text-subtle" />
          <span className="text-foreground tabular-nums font-medium">{summary.total}</span>
          <span>{summary.total === 1 ? 'company' : 'companies'}</span>
        </div>

        <span aria-hidden className="h-3 w-px bg-border" />

        <div className="flex items-center gap-3 font-sans text-caption text-muted tabular-nums">
          <span>
            <span className="text-foreground font-medium">{summary.parents}</span>{' '}
            {summary.parents === 1 ? 'parent' : 'parents'}
          </span>
          <span aria-hidden className="text-subtle">·</span>
          <span>
            <span className="text-foreground font-medium">{summary.subsidiaries}</span>{' '}
            subsidiaries
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {summary.suspended > 0 && (
            <button
              type="button"
              onClick={() => setHighlightSuspended((v) => !v)}
              aria-pressed={highlightSuspended}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-sm text-micro font-medium transition-colors',
                highlightSuspended
                  ? 'bg-[rgba(232,71,106,0.18)] text-[#e8476a] border border-[rgba(232,71,106,0.38)]'
                  : 'bg-[rgba(232,71,106,0.08)] text-[#e8476a] border border-transparent hover:bg-[rgba(232,71,106,0.14)]',
              )}
            >
              <AlertTriangle aria-hidden size={11} strokeWidth={2} />
              <span>
                <span className="tabular-nums">{summary.suspended}</span> suspended
              </span>
            </button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={refetch}
            aria-label="Refresh hierarchy"
            className="text-subtle hover:text-foreground"
          >
            <RefreshCcw aria-hidden size={13} strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div className="kb-hierarchy flex-1 min-h-0">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={FIT_VIEW_OPTIONS}
          minZoom={0.3}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
          elementsSelectable
          panOnScroll
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
          onNodeClick={handleNodeClick}
          onPaneClick={closeDetail}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: 'rgba(235, 234, 229, 0.16)' },
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="rgba(235, 234, 229, 0.05)"
          />
          <Controls showInteractive={false} className="kb-hierarchy-controls" />
        </ReactFlow>
      </div>

      <Sheet
        open={!!selectedCompany}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-[400px] p-0 bg-surface-200">
          <SheetTitle className="sr-only">Company details</SheetTitle>
          {selectedCompany && (
            <CompanyPopover
              companyId={selectedCompany.id}
              fallback={selectedCompany}
              onAddSubsidiary={handleAddSubsidiary}
              onClose={closeDetail}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={!!addSubsidiaryFor}
        onOpenChange={(open) => {
          if (!open) closeAddSubsidiary();
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-[440px] p-0 bg-surface-200">
          <SheetTitle className="sr-only">
            {addSubsidiaryFor ? `Add subsidiary to ${addSubsidiaryFor.name}` : 'Add subsidiary'}
          </SheetTitle>
          {addSubsidiaryFor && (
            <div className="flex h-full flex-col">
              <div className="px-5 py-4 border-b border-border">
                <p className="font-sans text-caption text-muted">Add subsidiary to</p>
                <p className="font-sans text-[15px] font-medium tracking-[-0.01em] text-foreground mt-0.5">
                  {addSubsidiaryFor.name}
                </p>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                <CompanyForm
                  onSubmit={handleCreateSubsidiary}
                  isPending={subsidiaryMutation.isPending || createMutation.isPending}
                  onCancel={closeAddSubsidiary}
                  submitLabel="Create subsidiary"
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function HierarchySkeleton() {
  return (
    <div
      className="flex flex-col rounded-lg border border-border overflow-hidden bg-surface-200/40"
      style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}
    >
      <div className="flex items-center gap-4 px-5 py-3 border-b border-border shrink-0">
        <Skeleton className="h-3 w-32" rounded="sm" />
        <Skeleton className="h-3 w-40" rounded="sm" />
      </div>
      <div className="flex-1 grid place-items-center">
        <div className="flex flex-col items-center gap-4 text-muted">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                rounded="md"
                className="w-44 h-20"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
          <p className="font-sans text-caption text-subtle">Laying out hierarchy…</p>
        </div>
      </div>
    </div>
  );
}

interface CompanyHierarchyProps {
  className?: string;
}

export function CompanyHierarchy({ className }: CompanyHierarchyProps) {
  return (
    <div className={cn('w-full', className)}>
      <ReactFlowProvider>
        <CompanyHierarchyInner />
      </ReactFlowProvider>
    </div>
  );
}

