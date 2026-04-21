"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Hash, Loader2, Save, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  usePermissions,
  useRolePermissions,
  useSetRolePermissions,
} from "@/hooks/useRoles";
import { cn } from "@/lib/utils";
import { humanizeModule } from "@/utils/role-display";
import type { Permission, Role } from "@/types";

interface PermissionMatrixProps {
  role: Role;
}

export function PermissionMatrix({ role }: PermissionMatrixProps) {
  const perms = usePermissions();
  const rolePerms = useRolePermissions(role.id);
  const setPerms = useSetRolePermissions(role.id);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [baseline, setBaseline] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (rolePerms.data) {
      const ids = new Set(rolePerms.data.map((p) => p.id));
      setSelected(new Set(ids));
      setBaseline(new Set(ids));
    }
  }, [rolePerms.data, role.id]);

  const dirty = useMemo(() => {
    if (selected.size !== baseline.size) return true;
    for (const id of selected) if (!baseline.has(id)) return true;
    return false;
  }, [selected, baseline]);

  const dirtyCount = useMemo(() => {
    const added = [...selected].filter((id) => !baseline.has(id)).length;
    const removed = [...baseline].filter((id) => !selected.has(id)).length;
    return added + removed;
  }, [selected, baseline]);

  const grouped = useMemo(() => {
    if (!perms.data) return [] as { module: string; items: Permission[] }[];
    const byModule = new Map<string, Permission[]>();
    for (const p of perms.data.items) {
      const key = p.module || "other";
      const arr = byModule.get(key) ?? [];
      arr.push(p);
      byModule.set(key, arr);
    }
    return [...byModule.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([module, items]) => ({
        module,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [perms.data]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllInModule = (items: Permission[], allOn: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of items) {
        if (allOn) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  };

  const onSave = async () => {
    try {
      await setPerms.mutateAsync({ permission_ids: [...selected] });
      setBaseline(new Set(selected));
      toast.success("Permissions saved", {
        description: `${role.name} updated with ${dirtyCount} ${dirtyCount === 1 ? "change" : "changes"}.`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save permissions.";
      toast.error("Save failed", { description: message });
    }
  };

  const onDiscard = () => setSelected(new Set(baseline));

  return (
    <div className="relative">
      {/* Header card */}
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-token-sm">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
          <ShieldCheck className="size-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 grow">
          <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em]">
            {role.name}
          </h2>
          <div className="mt-0.5 font-mono text-[12px] text-[var(--fg-muted)]">
            {role.slug}
          </div>
          {role.description && (
            <p className="mt-2 text-[13px] text-[var(--fg-muted)] max-w-[68ch]">
              {role.description}
            </p>
          )}
        </div>
        <dl className="grid grid-cols-3 gap-6 sm:min-w-[260px]">
          <Stat label="Level" value={`L${role.hierarchy_level}`} />
          <Stat
            label="Default"
            value={role.is_default ? "Yes" : "No"}
          />
          <Stat
            label="Type"
            value={role.role_type.replace("_", " ")}
          />
        </dl>
      </div>

      {/* Matrix card */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-token-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
              Permissions
            </h3>
            <div className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
              {selected.size} of {perms.data?.total ?? 0} enabled
            </div>
          </div>
        </div>

        {perms.isLoading || rolePerms.isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-5 animate-spin text-[var(--fg-subtle)]" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-[var(--fg-subtle)]">
            No permissions available.
          </div>
        ) : (
          <div>
            {grouped.map(({ module, items }, gi) => {
              const allOn = items.every((p) => selected.has(p.id));
              return (
                <div key={module}>
                  <div className="sticky top-0 z-[1] flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-2.5">
                    <Hash className="size-3.5 text-[var(--fg-subtle)]" strokeWidth={1.75} />
                    <div className="text-[13px] font-semibold text-[var(--fg)]">
                      {humanizeModule(module)}
                    </div>
                    <span className="text-[11px] text-[var(--fg-subtle)]">
                      {items.filter((p) => selected.has(p.id)).length}/{items.length}
                    </span>
                    <div className="grow" />
                    <button
                      type="button"
                      onClick={() => toggleAllInModule(items, allOn)}
                      className="inline-flex h-6 items-center rounded-md px-2 text-[11px] font-medium text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
                    >
                      {allOn ? "Clear all" : "Enable all"}
                    </button>
                  </div>
                  {items.map((p, ci) => {
                    const isOn = selected.has(p.id);
                    const inBaseline = baseline.has(p.id);
                    const rowDirty = isOn !== inBaseline;
                    const isLast =
                      gi === grouped.length - 1 && ci === items.length - 1;
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          "grid cursor-pointer grid-cols-[1fr_auto] items-start gap-4 px-5 py-3 transition-colors",
                          !isLast && "border-b border-[var(--border)]",
                          rowDirty && "bg-[var(--primary-soft)]/40",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-[var(--fg)]">
                              {p.name}
                            </span>
                            <span className="font-mono text-[11px] text-[var(--fg-subtle)]">
                              {p.resource_type}:{p.action}
                            </span>
                          </div>
                          {p.description && (
                            <div className="mt-0.5 text-[12px] text-[var(--fg-muted)]">
                              {p.description}
                            </div>
                          )}
                        </div>
                        <Checkbox
                          checked={isOn}
                          onCheckedChange={() => toggle(p.id)}
                          className="mt-1"
                        />
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div className="pointer-events-none sticky bottom-4 z-20 mt-4 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-token-lg">
            <span
              className="inline-block size-2 rounded-full bg-[var(--warning)]"
              aria-hidden="true"
            />
            <span className="text-[13px] text-[var(--fg)]">
              <strong className="font-semibold">{dirtyCount}</strong>{" "}
              {dirtyCount === 1 ? "change" : "changes"} pending
            </span>
            <div className="h-5 w-px bg-[var(--border)]" />
            <button
              type="button"
              onClick={onDiscard}
              disabled={setPerms.isPending}
              className="btn btn-ghost btn-sm"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={setPerms.isPending}
              className="btn btn-primary btn-sm"
            >
              {setPerms.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" strokeWidth={1.75} />
              )}
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="caption-upper mb-1">{label}</dt>
      <dd className="font-display text-[16px] font-semibold capitalize -tracking-[0.01em] text-[var(--fg)]">
        {value}
      </dd>
    </div>
  );
}
