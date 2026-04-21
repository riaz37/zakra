"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/store/authStore";
import { ZakraMark } from "@/components/admin/zakra-mark";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values);
      toast.success("Signed in");
      router.replace("/dashboard");
    } catch {
      // toast handled by error effect
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Form panel */}
      <div className="flex w-full flex-col border-r border-[var(--border)] bg-[var(--surface)] px-8 py-12 md:w-1/2 md:px-14">
        <Link href="/" className="inline-flex items-center gap-2.5 font-display text-[18px] font-semibold">
          <ZakraMark size={28} />
          Zakra
        </Link>

        <div className="mx-auto my-auto w-full max-w-[420px]">
          <h1 className="font-display text-[28px] font-semibold leading-[34px] -tracking-[0.01em]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[14px] text-[var(--fg-muted)]">
            Sign in to continue to Zakra.
          </p>

          <form className="mt-7 flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--fg-muted)]">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="h-[42px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-subtle)] hover:border-[var(--fg-subtle)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--ring)]"
              />
              {errors.email && (
                <p className="mt-1 text-[12px] text-[var(--destructive)]">{errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="mb-1.5 flex items-center">
                <label className="grow text-[13px] font-medium text-[var(--fg-muted)]">Password</label>
                <span className="text-[12px] text-[var(--fg-subtle)]">Contact admin to reset</span>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-[42px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-subtle)] hover:border-[var(--fg-subtle)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--ring)]"
              />
              {errors.password && (
                <p className="mt-1 text-[12px] text-[var(--destructive)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="mt-1 inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-[var(--primary)] text-[14px] font-medium text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
            >
              {(submitting || isLoading) && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center text-[12px] text-[var(--fg-subtle)]">
            Don&apos;t have an account?{" "}
            <Link href="/" className="text-[var(--primary)]">
              Request access
            </Link>
          </div>
        </div>

        <div className="flex gap-4 text-[12px] text-[var(--fg-subtle)]">
          <span>© 2026 Zakra</span>
          <Link href="/" className="text-[var(--fg-muted)]">
            Privacy
          </Link>
          <Link href="/" className="text-[var(--fg-muted)]">
            Terms
          </Link>
        </div>
      </div>

      {/* Tagline panel */}
      <div className="relative hidden flex-1 overflow-hidden bg-[var(--primary-soft)] md:block">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--primary) 0%, transparent 40%), radial-gradient(circle at 80% 60%, var(--primary) 0%, transparent 35%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-center p-14">
          <div className="max-w-[440px]">
            <p className="font-display text-[40px] font-semibold leading-[1.1] -tracking-[0.01em] text-[var(--fg)]">
              Query your data. Talk to your data. Ship reports without the wait.
            </p>
            <p className="mt-4 text-[15px] leading-[24px] text-[var(--fg-muted)]">
              The admin surface your team uses to connect databases, assign roles, run SQL, and
              deliver reports — in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
