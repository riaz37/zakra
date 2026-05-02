import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="flex max-w-md flex-col items-start gap-6 animate-fade-up">
        <p className="font-sans text-hero font-normal leading-none tracking-[-0.04em] text-foreground">
          404
        </p>
        <div className="flex flex-col gap-2">
          <p className="font-sans text-sub font-medium text-foreground">
            Page not found
          </p>
          <p className="font-sans text-body text-fg-muted">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Button render={<Link href="/" />}>Go to dashboard</Button>
      </div>
    </div>
  );
}
