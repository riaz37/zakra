'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-12">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred. Try refreshing the page or click below to retry."
        onRetry={reset}
        className="max-w-md"
      />
    </div>
  );
}
