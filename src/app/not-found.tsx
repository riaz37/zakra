import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="flex max-w-md flex-col items-start gap-6 animate-fade-up">
        <p className="font-sans text-[80px] font-normal leading-none tracking-[-0.04em] text-foreground">
          404
        </p>
        <div className="flex flex-col gap-2">
          <p className="font-sans text-[18px] font-medium text-foreground">
            Page not found
          </p>
          <p className="font-sans text-body text-muted">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-sans text-button font-medium text-background transition-colors duration-150 hover:bg-accent/90 focus-visible:outline-none"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
