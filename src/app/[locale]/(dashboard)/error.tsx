'use client';

import { useTranslations } from 'next-intl';
import { ErrorState } from '@/components/shared/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const t = useTranslations('common.error');

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-12">
      <ErrorState
        title={t('title')}
        description={t('description')}
        onRetry={reset}
        className="max-w-md"
      />
    </div>
  );
}
