"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  Loader2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ConnectionTestResult,
  DatabaseConnection,
  DatabaseConnectionCreate,
  DatabaseType,
} from "@/types";
import {
  useCreateConnection,
  useTestConnection,
} from "@/hooks/useDbConnections";

interface ConnectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | undefined;
}

const ENGINES: { id: DatabaseType; label: string; defaultPort: number; blurb: string }[] = [
  { id: "postgresql", label: "PostgreSQL", defaultPort: 5432, blurb: "Relational · SQL · ACID" },
  { id: "mssql", label: "SQL Server", defaultPort: 1433, blurb: "Microsoft · T-SQL" },
  { id: "mongodb", label: "MongoDB", defaultPort: 27017, blurb: "Document · JSON" },
];

const credentialsSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  host: z.string().min(1, "Host is required"),
  port: z
    .number({ error: "Port must be a number" })
    .int()
    .min(1)
    .max(65535),
  database_name: z.string().min(1, "Database is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl_enabled: z.boolean(),
});

type CredentialsInput = z.infer<typeof credentialsSchema>;

type Step = 1 | 2 | 3;

export function ConnectionWizard({
  open,
  onOpenChange,
  companyId,
}: ConnectionWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [engine, setEngine] = useState<DatabaseType>("postgresql");
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [pendingTest, setPendingTest] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const createConnection = useCreateConnection(companyId);
  const testConnection = useTestConnection(companyId);

  const defaults: CredentialsInput = {
    name: "",
    host: "",
    port: ENGINES[0].defaultPort,
    database_name: "",
    username: "",
    password: "",
    ssl_enabled: true,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CredentialsInput>({
    resolver: zodResolver(credentialsSchema as never),
    defaultValues: defaults,
    mode: "onBlur",
  });

  const values = watch();

  const handleEnginePick = (id: DatabaseType) => {
    setEngine(id);
    const engineDef = ENGINES.find((e) => e.id === id);
    if (engineDef) setValue("port", engineDef.defaultPort);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setEngine("postgresql");
      setTestResult(null);
      setCreatedId(null);
      reset(defaults);
    }, 200);
  };

  const createFromForm = async (form: CredentialsInput): Promise<boolean> => {
    const payload: DatabaseConnectionCreate = {
      name: form.name,
      database_type: engine,
      host: form.host,
      port: form.port,
      database_name: form.database_name,
      username: form.username,
      password: form.password,
      ssl_enabled: form.ssl_enabled,
    };
    try {
      const created: DatabaseConnection = await createConnection.mutateAsync(payload);
      setCreatedId(created.id);
      toast.success("Connection saved", { description: created.name });
      return true;
    } catch (err) {
      toast.error("Could not save connection", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      return false;
    }
  };

  const runTest = async () => {
    if (!createdId) {
      toast.error("Save the connection before testing");
      return;
    }
    setPendingTest(true);
    setTestResult(null);
    try {
      const result = await testConnection.mutateAsync(createdId);
      setTestResult(result);
      if (result.success) {
        toast.success("Connection verified", {
          description: result.latency_ms ? `${result.latency_ms}ms` : undefined,
        });
      } else {
        toast.error("Test failed", { description: result.message });
      }
    } catch (err) {
      toast.error("Test failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setPendingTest(false);
    }
  };

  const goNext = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      await handleSubmit(async (form) => {
        const ok = await createFromForm(form);
        if (ok) setStep(3);
      })();
    }
  };

  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent
        className="w-[calc(100%-2rem)] gap-0 p-0 sm:max-w-[620px]"
        showCloseButton={false}
      >
        <header className="flex items-start gap-3 border-b border-[var(--border)] px-6 py-5">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
            <Database className="size-[18px]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 grow">
            <DialogTitle className="font-display text-[18px] font-semibold leading-[24px] -tracking-[0.01em]">
              New connection
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] text-[var(--fg-subtle)]">
              Step {step} of 3 ·{" "}
              {step === 1 ? "Engine" : step === 2 ? "Credentials" : "Test & save"}
            </DialogDescription>
          </div>
          <StepDots step={step} />
        </header>

        <div className="px-6 py-6">
          {step === 1 && <EngineStep value={engine} onChange={handleEnginePick} />}

          {step === 2 && (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void goNext();
              }}
            >
              <Field label="Display name" error={errors.name?.message}>
                <Input placeholder="prod-analytics" {...register("name")} />
              </Field>

              <div className="grid grid-cols-[2fr_1fr] gap-3">
                <Field label="Host" error={errors.host?.message}>
                  <Input
                    className="font-mono"
                    placeholder="db.example.com"
                    {...register("host")}
                  />
                </Field>
                <Field label="Port" error={errors.port?.message}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    className="font-mono"
                    {...register("port", { valueAsNumber: true })}
                  />
                </Field>
              </div>

              <Field label="Database" error={errors.database_name?.message}>
                <Input
                  className="font-mono"
                  placeholder="analytics"
                  {...register("database_name")}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Username" error={errors.username?.message}>
                  <Input {...register("username")} />
                </Field>
                <Field label="Password" error={errors.password?.message}>
                  <Input type="password" {...register("password")} />
                </Field>
              </div>

              <label
                htmlFor="ssl-toggle"
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-input)] bg-[var(--surface-muted)] px-3 py-2.5"
              >
                <Switch
                  id="ssl-toggle"
                  checked={values.ssl_enabled}
                  onCheckedChange={(v) => setValue("ssl_enabled", v)}
                />
                <div className="min-w-0 grow">
                  <div className="text-[13px] font-medium">Require SSL</div>
                  <div className="text-[12px] text-[var(--fg-subtle)]">
                    Encrypt all traffic to this connection.
                  </div>
                </div>
              </label>

              <button type="submit" className="hidden" aria-hidden />
            </form>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Database className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium">{values.name || "new-connection"}</div>
                    <div className="truncate font-mono text-[12px] text-[var(--fg-subtle)]">
                      {values.host}:{values.port} / {values.database_name}
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-[13px]">
                  <dt className="text-[var(--fg-muted)]">Engine</dt>
                  <dd className="font-medium">
                    {ENGINES.find((e) => e.id === engine)?.label}
                  </dd>
                  <dt className="text-[var(--fg-muted)]">User</dt>
                  <dd className="font-mono">{values.username || "—"}</dd>
                  <dt className="text-[var(--fg-muted)]">SSL</dt>
                  <dd>{values.ssl_enabled ? "Required" : "Optional"}</dd>
                </dl>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={runTest}
                  disabled={pendingTest || !createdId}
                >
                  {pendingTest ? (
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                  ) : (
                    <Zap className="size-3.5" strokeWidth={1.75} />
                  )}
                  Test connection
                </Button>
                {testResult?.success && (
                  <Badge className="gap-1 bg-[var(--primary-soft)] text-[var(--primary)]">
                    <CheckCircle2 className="size-3" strokeWidth={2} />
                    Connected
                    {testResult.latency_ms ? ` · ${testResult.latency_ms}ms` : ""}
                  </Badge>
                )}
                {testResult && !testResult.success && (
                  <Badge className="gap-1 bg-[var(--destructive-soft)] text-[var(--destructive)]">
                    <AlertCircle className="size-3" strokeWidth={2} />
                    Failed
                  </Badge>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-[var(--radius-input)] bg-[var(--info-soft)] px-3 py-2.5 text-[13px] text-[var(--info)]">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
                <div>
                  Once created, table-level access still needs to be configured per role. Head
                  over to <span className="font-medium">Table Access</span> to get started.
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)]/40 px-6 py-4">
          <Button variant="ghost" onClick={close}>
            {step === 3 && createdId ? "Close" : "Cancel"}
          </Button>
          <div className="grow" />
          {step > 1 && step < 3 && (
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              Back
            </Button>
          )}
          {step < 3 && (
            <Button
              onClick={() => void goNext()}
              disabled={createConnection.isPending}
            >
              {step === 2 && createConnection.isPending ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
              ) : null}
              {step === 1 ? "Continue" : "Save connection"}
              {step === 1 && <ArrowRight className="size-3.5" strokeWidth={1.75} />}
            </Button>
          )}
          {step === 3 && (
            <Button onClick={close}>Done</Button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === step
              ? "w-6 bg-[var(--primary)]"
              : i < step
                ? "w-1.5 bg-[var(--primary)]"
                : "w-1.5 bg-[var(--border-strong)]"
          }`}
        />
      ))}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[13px] font-medium text-[var(--fg-muted)]">{label}</Label>
      {children}
      {error && (
        <div className="text-[12px] text-[var(--destructive)]">{error}</div>
      )}
    </div>
  );
}

function EngineStep({
  value,
  onChange,
}: {
  value: DatabaseType;
  onChange: (v: DatabaseType) => void;
}) {
  return (
    <div>
      <div className="mb-3 text-[13px] font-medium text-[var(--fg-muted)]">
        Choose an engine
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ENGINES.map((e) => {
          const active = value === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onChange(e.id)}
              className={`group flex flex-col items-start gap-2 rounded-[var(--radius-card)] border p-4 text-left transition-all ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-token-sm"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-subtle)]"
              }`}
            >
              <span
                className={`inline-flex size-10 items-center justify-center rounded-[10px] ${
                  active
                    ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                    : "bg-[var(--surface-muted)] text-[var(--fg-muted)]"
                }`}
              >
                <Database className="size-[20px]" strokeWidth={1.75} />
              </span>
              <div className="mt-1">
                <div
                  className={`text-[14px] font-medium ${active ? "text-[var(--primary)]" : ""}`}
                >
                  {e.label}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-[var(--fg-subtle)]">
                  {e.blurb} · :{e.defaultPort}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
