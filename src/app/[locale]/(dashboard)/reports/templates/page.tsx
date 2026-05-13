'use client';

import { useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Plus, FilePlus } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { useReportTemplates, useDeleteReportTemplate } from '@/hooks/useReportTemplates';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import type { ReportTemplate } from '@/types';

import { PageHeader } from '@/components/shared/page-header';
import {
  ScaffoldContainer,
  ScaffoldFilterAndContent,
} from '@/components/shared/scaffold';
import { reportNavigationItems } from '@/components/features/reports/nav';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { TemplateCard, TemplateCardSkeleton } from '@/components/features/reports/template-card';
import { AnimatedPage } from '@/components/shared/animated-container';
import { staggerContainer, staggerScaleItem, fadeUp, fadeIn } from '@/lib/motion';

export default function ReportTemplatesPage() {
  const t = useTranslations('dashboard.reports');
  const router = useRouter();
  const pathname = usePathname();
  const companyId = useCurrentCompanyId();
  const [deleteTarget, setDeleteTarget] = useState<ReportTemplate | null>(null);
  const reduced = useReducedMotion();

  const { data, isLoading, isError, refetch } = useReportTemplates(companyId);
  const deleteMutation = useDeleteReportTemplate(companyId);

  const templates = data?.templates ?? [];

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <ScaffoldContainer>
      <PageHeader
        title={t('title')}
        subtitle={t('templatesSubtitle')}
        navigationItems={reportNavigationItems(pathname)}
        primaryActions={
          <Button
            onClick={() => router.push('/reports/templates/new')}
            className="h-9 px-4"
          >
            {t('templates.newTemplate')}
          </Button>
        }
      />

      <AnimatedPage>
        <ScaffoldFilterAndContent className="mt-6">
          <AnimatePresence mode="wait">
            {isError ? (
              <motion.div
                key="error"
                variants={fadeUp}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
                exit="exit"
              >
                <ErrorState title={t('templates.error.loadTitle')} onRetry={() => refetch()} />
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                variants={fadeIn}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <TemplateCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : templates.length === 0 ? (
              <motion.div
                key="empty"
                variants={fadeUp}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
                exit="exit"
              >
                <EmptyState
                  icon={FilePlus}
                  title={t('templates.empty.title')}
                  description={t('templates.empty.description')}
                  action={
                    <Button
                      onClick={() => router.push('/reports/templates/new')}
                      className="h-9 px-4"
                    >
                      {t('templates.newTemplate')}
                    </Button>
                  }
                />
              </motion.div>
            ) : (
              <motion.div
                key="cards"
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                variants={staggerContainer}
                initial={reduced ? 'visible' : 'hidden'}
                animate="visible"
              >
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    variants={staggerScaleItem}
                    whileHover={{ y: -2, transition: { duration: 0.12, ease: 'easeOut' } }}
                    className="h-full"
                  >
                    <TemplateCard
                      template={template}
                      onEdit={(t) => router.push(`/reports/templates/${t.id}`)}
                      onDelete={(t) => setDeleteTarget(t)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </ScaffoldFilterAndContent>
      </AnimatedPage>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('templates.confirmDelete.title')}
        description={t('templates.confirmDelete.description', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('templates.confirmDelete.confirmLabel')}
        variant="destructive"
      />
    </ScaffoldContainer>
  );
}
