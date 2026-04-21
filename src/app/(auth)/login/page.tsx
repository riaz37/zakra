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
      router.push('/');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    }
  }

  return (
    <div className="w-full max-w-[360px]">
      {/* Product name */}
      <h1
        className="text-center font-display font-normal text-foreground"
        style={{ fontSize: '36px', letterSpacing: '-0.72px' }}
      >
        ESAP-KB
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 flex flex-col gap-5"
        noValidate
      >
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="font-sans text-button text-muted"
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
              'rounded-lg border bg-background px-3 py-2 font-sans text-button text-foreground outline-none placeholder:text-muted/50 transition-colors',
              errors.email
                ? 'border-error bg-error/5 focus:border-error'
                : 'border-border focus:border-border-medium',
            )}
            placeholder="you@company.com"
          />
          {errors.email && (
            <p className="font-sans text-caption text-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="font-sans text-button text-muted"
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
              'rounded-lg border bg-background px-3 py-2 font-sans text-button text-foreground outline-none placeholder:text-muted/50 transition-colors',
              errors.password
                ? 'border-error bg-error/5 focus:border-error'
                : 'border-border focus:border-border-medium',
            )}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="font-sans text-caption text-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* API error */}
        {apiError && (
          <p
            className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 font-sans text-button text-error"
            role="alert"
          >
            {apiError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex w-full items-center justify-center rounded-lg border border-border bg-surface-300 px-3.5 py-2.5 font-sans text-button text-foreground shadow-ring transition-all duration-150 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
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
