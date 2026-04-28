'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const { selectedCompanyId } = useCompanyStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/overview');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFields) {
    setApiError(null);
    try {
      await login({ email: values.email, password: values.password });
      const user = useAuthStore.getState().user;
      const resolvedCompanyId = user?.company_id ?? selectedCompanyId;
      if (!resolvedCompanyId) {
        router.push('/select-company');
      } else {
        router.push('/overview');
      }
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Sign in failed. Please try again.',
      );
    }
  }

  return (
    <div className="w-full max-w-[340px] animate-fade-up rounded-card border border-border bg-surface-100 px-6 py-8">
      {/* Brand */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-center gap-2.5">
          <Image
            src="/logo/esaplogo.webp"
            alt="ESAP"
            width={32}
            height={32}
            priority
          />
          <Image
            src="/logo/esaplogo.svg"
            alt="ESAP employer solutions"
            width={65}
            height={21}
            priority
          />
        </div>
        <p className="font-sans text-caption text-muted">Admin console</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div className="flex flex-col">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            error={!!errors.email}
            placeholder="you@company.com"
          />
          {errors.email && (
            <p className="mt-1.5 font-sans text-caption text-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password — 16px gap between fields */}
        <div className="mt-4 flex flex-col">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={!!errors.password}
            error={!!errors.password}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 font-sans text-caption text-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit — 24px gap from last field */}
        <Button
          type="submit"
          isLoading={isSubmitting}
          size="lg"
          className="mt-6 w-full"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="mt-4 font-sans text-caption text-muted">
          First time signing in? Check your invite email for credentials.
        </p>

        {/* API error — bare, no box */}
        {apiError && (
          <p
            className="mt-3 font-sans text-caption text-error"
            role="alert"
          >
            {apiError}
          </p>
        )}
      </form>
    </div>
  );
}

