import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      role="main"
      className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8 overflow-y-auto"
    >
      {children}
    </main>
  );
}
