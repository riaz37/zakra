'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth, useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
  errorShake,
  MOTION,
} from '@/lib/motion';

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
  const reduced = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);

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
    <motion.div
      variants={fadeUp}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      className="w-full max-w-[340px] rounded-card border border-border bg-surface-200 px-6 py-5"
    >
      {/* Brand */}
      <motion.div
        className="mb-4"
        initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/logo/zakralogo.png"
            alt="Zakra"
            width={120}
            height={36}
            priority
            className="object-contain"
          />
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        variants={staggerContainer}
        initial={reduced ? 'visible' : 'hidden'}
        animate="visible"
      >
        {/* Email */}
        <motion.div variants={staggerItem} className="flex flex-col">
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
          <AnimatePresence>
            {errors.email && (
              <motion.p
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-1.5 font-sans text-caption text-error"
                role="alert"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password — 16px gap between fields */}
        <motion.div variants={staggerItem} className="mt-4 flex flex-col">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              aria-invalid={!!errors.password}
              error={!!errors.password}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-fg-subtle transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.5} />
              ) : (
                <Eye size={16} strokeWidth={1.5} />
              )}
            </button>
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-1.5 font-sans text-caption text-error"
                role="alert"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Submit — 24px gap from last field */}
        <motion.div variants={staggerItem}>
          <motion.div
            variants={errorShake}
            animate={apiError ? 'shake' : undefined}
          >
            <Button
              type="submit"
              isLoading={isSubmitting}
              size="lg"
              className="mt-6 w-full"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </motion.div>
        </motion.div>

        <motion.p
          variants={staggerItem}
          className="mt-4 font-sans text-caption text-muted"
        >
          First time signing in? Check your invite email for credentials.
        </motion.p>

        {/* API error — bare, no box */}
        <AnimatePresence>
          {apiError && (
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-3 font-sans text-caption text-error"
              role="alert"
            >
              {apiError}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </motion.div>
  );
}
