'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver as zodResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { useAuth } from '@/store/authStore';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

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
      router.push('/chat');
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Sign in failed. Please try again.',
      );
    }
  }

  return (
    <div className="w-full max-w-[340px] animate-fade-up px-6 py-8">
      {/* Brand */}
      <div className="mb-8">
        <h1 className="font-sans text-[18px] font-semibold tracking-[-0.36px] text-foreground">
          ESAP<span className="text-accent">-</span>KB
        </h1>
        <p className="mt-1 font-sans text-caption text-muted">
          Admin console
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="mb-1.5 block font-sans text-caption text-muted"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            className={cn(
              'w-full rounded-lg border bg-surface-200 px-3 py-2.5 font-sans text-[14px] text-foreground transition-colors duration-150',
              'placeholder:text-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(62,207,142,0.4)]',
              errors.email
                ? 'border-error focus:border-error'
                : 'border-border focus:border-accent',
            )}
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
          <label
            htmlFor="password"
            className="mb-1.5 block font-sans text-caption text-muted"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={!!errors.password}
            className={cn(
              'w-full rounded-lg border bg-surface-200 px-3 py-2.5 font-sans text-[14px] text-foreground transition-colors duration-150',
              'placeholder:text-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(62,207,142,0.4)]',
              errors.password
                ? 'border-error focus:border-error'
                : 'border-border focus:border-accent',
            )}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 font-sans text-caption text-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit — 24px gap from last field */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'mt-6 flex w-full items-center justify-center rounded-lg bg-accent py-2.5 font-sans text-[14px] font-medium text-[#111]',
            'transition-colors duration-150 hover:bg-[#4ed99a]',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </button>

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

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
