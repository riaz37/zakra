import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default async function NotFound() {
  const t = await getTranslations('common.notFound');

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="flex max-w-md flex-col items-start gap-6 animate-fade-up">
        <p className="font-sans text-hero font-normal leading-none tracking-[-0.04em] text-foreground">
          {t('title')}
        </p>
        <div className="flex flex-col gap-2">
          <p className="font-sans text-sub font-medium text-foreground">
            {t('heading')}
          </p>
          <p className="font-sans text-body text-fg-muted">
            {t('description')}
          </p>
        </div>
        <Button render={<Link href="/" />}>{t('goHome')}</Button>
      </div>
    </div>
  );
}
