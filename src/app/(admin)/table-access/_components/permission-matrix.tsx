"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Filter,
  Loader2,
  Save,
  ShieldCheck,
  Undo2,
  UserCog,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useBulkGrantPermissions,
  useManagedTable,
  useTablePermissions,
} from "@/hooks/useTableAccess";
import { useUsers } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import type {
  BulkGrantPermissions,
  ColumnPermission,
  GrantColumnPermission,
  MaskPattern,
} from "@/types";
import type { Role } from "@/types/role";
import type { User } from "@/types/user";

const PERMISSIONS: { value: ColumnPermission; label: string }[] = [
  { value: "none", label: "None" },
  { value: "read", label: "Read" },
  { value: "read_masked", label: "Masked" },
  { value: "write", label: "Write" },
];

const MASK_OPTIONS: MaskPattern[] = ["EMAIL", "PHONE", "SSN", "PARTIAL", "FULL"];

type GranteeMode = "user" | "role";
type GranteePrefix = "u" | "r";
type CellKey = `${GranteePrefix}:${string}:${string}`;

interface CellState {
  permission: ColumnPermission;
  mask_pattern: MaskPattern | null;
  row_filter: string | null;
}

interface PermissionMatrixProps {
  table: {
    table_name: string;
    schema_name: string;
    display_name?: string;
    description?: string | null;
  };
  companyId: string | undefined;
}

function cellKey(
  prefix: GranteePrefix,
  granteeId: string,
  columnName: string,
): CellKey {
  return `${prefix}:${granteeId}:${columnName}`;
}

function prefixFor(mode: GranteeMode): GranteePrefix {
  return mode === "role" ? "r" : "u";
}

function parseCellKey(
  key: CellKey,
): { prefix: GranteePrefix; granteeId: string; columnName: string } {
  const [prefix, granteeId, ...rest] = key.split(":");
  return {
    prefix: prefix as GranteePrefix,
    granteeId: granteeId ?? "",
    columnName: rest.join(":"),
  };
}

export function PermissionMatrix({ table, companyId }: PermissionMatrixProps) {
  const managedTable = useManagedTable(table.table_name, table.schema_name);
  const permissions = useTablePermissions(table.table_name, table.schema_name);
  // Both grantee queries always run so switching between User/Role is instant
  // and cached. Rendering is gated on granteeMode below.
  const users = useUsers({ company_id: companyId, page: 1, page_size: 50 });
  const roles = useRoles({ company_id: companyId, page: 1, page_size: 50 });
  const bulkGrant = useBulkGrantPermissions(table.table_name, table.schema_name);

  const [granteeMode, setGranteeMode] = useState<GranteeMode>("user");

  const columns = useMemo(
    () => managedTable.data?.columns ?? [],
    [managedTable.data],
  );

  // Single map keyed by `${u|r}:${granteeId}:${column}` — preserves unsaved
  // edits when the operator toggles between User and Role modes.
  const [matrix, setMatrix] = useState<Record<CellKey, CellState>>({});
  const [baseline, setBaseline] = useState<Record<CellKey, CellState>>({});

  // Seed the matrix once inputs are ready. We iterate every grant and every
  // known grantee, keying with the correct prefix, so both user- and role-
  // mode rows are pre-populated from a single effect run.
  useEffect(() => {
    if (!managedTable.data || !users.data || !roles.data) return;
    const next: Record<CellKey, CellState> = {};
    const userIds = users.data.items.map((u) => u.id);
    const roleIds = roles.data.items.map((r) => r.id);
    const cols = managedTable.data.columns;

    for (const userId of userIds) {
      for (const col of cols) {
        next[cellKey("u", userId, col.name)] = {
          permission: "none",
          mask_pattern: null,
          row_filter: null,
        };
      }
    }
    for (const roleId of roleIds) {
      for (const col of cols) {
        next[cellKey("r", roleId, col.name)] = {
          permission: "none",
          mask_pattern: null,
          row_filter: null,
        };
      }
    }

    if (permissions.data) {
      for (const grant of permissions.data) {
        const prefix: GranteePrefix = grant.grantee_type === "role" ? "r" : "u";
        const key = cellKey(prefix, grant.grantee_id, grant.column_name);
        if (key in next) {
          next[key] = {
            permission: grant.permission,
            mask_pattern: grant.mask_pattern ?? null,
            row_filter: grant.row_filter ?? null,
          };
        }
      }
    }
    setMatrix(next);
    setBaseline(next);
  }, [managedTable.data, permissions.data, users.data, roles.data]);

  const dirty = useMemo(() => {
    const changes: {
      prefix: GranteePrefix;
      granteeId: string;
      columnName: string;
      state: CellState;
    }[] = [];
    for (const key of Object.keys(matrix) as CellKey[]) {
      const current = matrix[key];
      const base = baseline[key];
      if (
        !base ||
        current.permission !== base.permission ||
        current.mask_pattern !== base.mask_pattern ||
        current.row_filter !== base.row_filter
      ) {
        const { prefix, granteeId, columnName } = parseCellKey(key);
        changes.push({ prefix, granteeId, columnName, state: current });
      }
    }
    return changes;
  }, [matrix, baseline]);

  const updateCell = (key: CellKey, update: Partial<CellState>) =>
    setMatrix((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...update,
        ...(update.permission && update.permission !== "read_masked"
          ? { mask_pattern: null }
          : {}),
        ...(update.permission === "read_masked" && !prev[key]?.mask_pattern
          ? { mask_pattern: "PARTIAL" as MaskPattern }
          : {}),
        // Drop the row_filter if the column is fully revoked — it has no
        // meaning once permission is `none`.
        ...(update.permission === "none" ? { row_filter: null } : {}),
      },
    }));

  const discard = () => setMatrix({ ...baseline });

  const save = async () => {
    if (dirty.length === 0) return;
    const grants: GrantColumnPermission[] = dirty.map((d) => ({
      column_name: d.columnName,
      grantee_type: d.prefix === "r" ? "role" : "user",
      grantee_id: d.granteeId,
      permission: d.state.permission,
      ...(d.state.mask_pattern ? { mask_pattern: d.state.mask_pattern } : {}),
      // Coerce null → undefined at the API boundary (create DTO uses optional
      // string, not nullable).
      ...(d.state.row_filter ? { row_filter: d.state.row_filter } : {}),
    }));
    const payload: BulkGrantPermissions = { grants };
    try {
      await bulkGrant.mutateAsync(payload);
      setBaseline({ ...matrix });
      toast.success("Permissions saved", {
        description: `${dirty.length} change${dirty.length === 1 ? "" : "s"} applied`,
      });
    } catch (err) {
      toast.error("Could not save permissions", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const loading =
    managedTable.isLoading ||
    permissions.isLoading ||
    (granteeMode === "user" ? users.isLoading : roles.isLoading);

  const activeRows =
    granteeMode === "user"
      ? (users.data?.items.length ?? 0)
      : (roles.data?.items.length ?? 0);

  return (
    <>
      <div className="flex items-start gap-4 border-b border-[var(--border)] px-6 py-5">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)]">
          <ShieldCheck className="size-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 grow">
          <h2 className="font-display text-[18px] font-semibold leading-[24px] -tracking-[0.01em]">
            {managedTable.data?.display_name || table.table_name}
          </h2>
          <div className="mt-0.5 truncate font-mono text-[12px] text-[var(--fg-subtle)]">
            {table.schema_name}.{table.table_name}
          </div>
          {managedTable.data?.description && (
            <p className="mt-2 max-w-[60ch] text-[13px] text-[var(--fg-muted)]">
              {managedTable.data.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="caption-upper">Columns</div>
          <div className="font-display text-[18px] font-semibold -tracking-[0.01em]">
            {columns.length}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-3">
        <GranteeSegmented
          value={granteeMode}
          onChange={setGranteeMode}
          userCount={users.data?.items.length ?? 0}
          roleCount={roles.data?.items.length ?? 0}
        />
        {dirty.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-badge)] bg-[var(--warning-soft)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--warning)]">
            <span className="inline-block size-1.5 rounded-full bg-[var(--warning)]" />
            {dirty.length} unsaved
          </span>
        )}
      </div>

      <div className="relative overflow-auto">
        {loading ? (
          <MatrixSkeleton />
        ) : columns.length === 0 ? (
          <MatrixWarning
            title="No columns registered"
            message="This table has no columns recorded. Re-learn the schema to discover columns."
          />
        ) : activeRows === 0 ? (
          <MatrixWarning
            title={
              granteeMode === "user"
                ? "No users in this workspace"
                : "No roles in this workspace"
            }
            message={
              granteeMode === "user"
                ? "Invite teammates to grant them access to this table."
                : "Create roles to grant shared access to this table."
            }
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 w-[280px] min-w-[240px] border-b border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-left">
                  <span className="caption-upper">
                    {granteeMode === "role" ? "Role" : "User"}
                  </span>
                </th>
                {columns.map((col) => (
                  <th
                    key={col.name}
                    className="sticky top-0 z-10 min-w-[180px] border-b border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-left"
                  >
                    <div className="flex flex-col">
                      <span className="truncate font-mono text-[12px] font-medium">
                        {col.name}
                      </span>
                      <span className="mt-0.5 truncate font-mono text-[10px] text-[var(--fg-subtle)]">
                        {col.data_type}
                        {col.is_nullable ? " · nullable" : ""}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {granteeMode === "user"
                ? users.data?.items.map((user) => (
                    <UserMatrixRow
                      key={user.id}
                      user={user}
                      columns={columns.map((c) => c.name)}
                      matrix={matrix}
                      onChange={updateCell}
                      baseline={baseline}
                    />
                  ))
                : roles.data?.items.map((role) => (
                    <RoleMatrixRow
                      key={role.id}
                      role={role}
                      columns={columns.map((c) => c.name)}
                      matrix={matrix}
                      onChange={updateCell}
                      baseline={baseline}
                    />
                  ))}
            </tbody>
          </table>
        )}
      </div>

      {dirty.length > 0 && (
        <div
          className="sticky bottom-0 z-30 flex items-center gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-3 shadow-token-lg"
        >
          <span className="inline-block size-2 rounded-full bg-[var(--warning)]" />
          <span className="text-[13px]">
            <strong>{dirty.length}</strong> change
            {dirty.length === 1 ? "" : "s"} pending
          </span>
          <div className="grow" />
          <Button variant="ghost" size="sm" onClick={discard}>
            <Undo2 className="size-3.5" strokeWidth={1.75} />
            Discard
          </Button>
          <Button size="sm" onClick={() => void save()} disabled={bulkGrant.isPending}>
            {bulkGrant.isPending ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Save className="size-3.5" strokeWidth={1.75} />
            )}
            Save changes
          </Button>
        </div>
      )}
    </>
  );
}

function GranteeSegmented({
  value,
  onChange,
  userCount,
  roleCount,
}: {
  value: GranteeMode;
  onChange: (mode: GranteeMode) => void;
  userCount: number;
  roleCount: number;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-[var(--radius-input)] px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";
  const active = "bg-[var(--primary-soft)] text-[var(--primary)]";
  const inactive =
    "text-[var(--fg-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg)]";
  return (
    <div
      role="tablist"
      aria-label="Grantee type"
      className="inline-flex items-center gap-1 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface-muted)] p-0.5"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "user"}
        onClick={() => onChange("user")}
        className={`${base} ${value === "user" ? active : inactive}`}
      >
        <UsersIcon className="size-3.5" strokeWidth={1.75} />
        Users
        <span className="font-mono text-[10px] text-[var(--fg-subtle)]">
          {userCount}
        </span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "role"}
        onClick={() => onChange("role")}
        className={`${base} ${value === "role" ? active : inactive}`}
      >
        <UserCog className="size-3.5" strokeWidth={1.75} />
        Roles
        <span className="font-mono text-[10px] text-[var(--fg-subtle)]">
          {roleCount}
        </span>
      </button>
    </div>
  );
}

function UserMatrixRow({
  user,
  columns,
  matrix,
  baseline,
  onChange,
}: {
  user: User;
  columns: string[];
  matrix: Record<CellKey, CellState>;
  baseline: Record<CellKey, CellState>;
  onChange: (key: CellKey, update: Partial<CellState>) => void;
}) {
  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
  const initials =
    (user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "") ||
    user.email[0]?.toUpperCase();
  return (
    <tr className="group">
      <th
        scope="row"
        className="sticky left-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-left align-middle"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[11px] font-semibold text-[var(--primary)]">
            {initials.toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium">{name}</div>
            <div className="truncate text-[11px] text-[var(--fg-subtle)]">
              {user.email}
            </div>
          </div>
        </div>
      </th>
      {columns.map((column) => {
        const key = cellKey("u", user.id, column);
        const cell = matrix[key] ?? {
          permission: "none",
          mask_pattern: null,
          row_filter: null,
        };
        const base = baseline[key];
        const isDirty =
          !base ||
          cell.permission !== base.permission ||
          cell.mask_pattern !== base.mask_pattern ||
          cell.row_filter !== base.row_filter;
        return (
          <td
            key={column}
            className={`border-b border-[var(--border)] px-3 py-2 align-middle ${
              isDirty ? "bg-[var(--primary-soft)]/30" : ""
            }`}
          >
            <PermissionCell
              value={cell}
              onChange={(update) => onChange(key, update)}
            />
          </td>
        );
      })}
    </tr>
  );
}

function RoleMatrixRow({
  role,
  columns,
  matrix,
  baseline,
  onChange,
}: {
  role: Role;
  columns: string[];
  matrix: Record<CellKey, CellState>;
  baseline: Record<CellKey, CellState>;
  onChange: (key: CellKey, update: Partial<CellState>) => void;
}) {
  return (
    <tr className="group">
      <th
        scope="row"
        className="sticky left-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-left align-middle"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-7 items-center justify-center rounded-[8px] bg-[var(--primary-soft)] text-[var(--primary)]">
            <UserCog className="size-3.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium">{role.name}</div>
            <div className="truncate text-[11px] text-[var(--fg-subtle)]">
              {role.description?.trim() || role.slug}
            </div>
          </div>
        </div>
      </th>
      {columns.map((column) => {
        const key = cellKey("r", role.id, column);
        const cell = matrix[key] ?? {
          permission: "none",
          mask_pattern: null,
          row_filter: null,
        };
        const base = baseline[key];
        const isDirty =
          !base ||
          cell.permission !== base.permission ||
          cell.mask_pattern !== base.mask_pattern ||
          cell.row_filter !== base.row_filter;
        return (
          <td
            key={column}
            className={`border-b border-[var(--border)] px-3 py-2 align-middle ${
              isDirty ? "bg-[var(--primary-soft)]/30" : ""
            }`}
          >
            <PermissionCell
              value={cell}
              onChange={(update) => onChange(key, update)}
            />
          </td>
        );
      })}
    </tr>
  );
}

function PermissionCell({
  value,
  onChange,
}: {
  value: CellState;
  onChange: (update: Partial<CellState>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [filterDraft, setFilterDraft] = useState(value.row_filter ?? "");

  // Keep the local draft in sync when the underlying cell state changes from
  // outside (e.g. Discard, or permission reset clearing row_filter).
  useEffect(() => {
    setFilterDraft(value.row_filter ?? "");
  }, [value.row_filter]);

  const canFilter = value.permission !== "none";
  const hasFilter = Boolean(value.row_filter);
  const isOpen = expanded && canFilter;

  const commitFilter = () => {
    const trimmed = filterDraft.trim();
    const next = trimmed.length === 0 ? null : trimmed;
    if (next !== value.row_filter) {
      onChange({ row_filter: next });
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <div className="relative grow">
          <select
            value={value.permission}
            onChange={(e) => onChange({ permission: e.target.value as ColumnPermission })}
            className="h-7 w-full appearance-none rounded-md border border-[var(--border-strong)] bg-[var(--surface)] pl-2 pr-6 font-mono text-[11px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--fg-subtle)] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {PERMISSIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-[var(--fg-subtle)]"
            strokeWidth={2}
          />
        </div>
        {canFilter && (
          <button
            type="button"
            aria-label={isOpen ? "Hide row filter" : "Edit row filter"}
            aria-expanded={isOpen}
            aria-pressed={hasFilter}
            onClick={() => setExpanded((v) => !v)}
            className={`relative inline-flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
              hasFilter
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--fg-subtle)] hover:border-[var(--fg-subtle)] hover:text-[var(--fg-muted)]"
            }`}
          >
            <Filter className="size-3" strokeWidth={1.75} />
            {hasFilter && !isOpen && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 inline-block size-1.5 rounded-full bg-[var(--primary)] ring-2 ring-[var(--surface)]"
              />
            )}
          </button>
        )}
      </div>

      {value.permission === "read_masked" && (
        <div className="relative">
          <select
            value={value.mask_pattern ?? "PARTIAL"}
            onChange={(e) =>
              onChange({ mask_pattern: e.target.value as MaskPattern })
            }
            className="h-6 w-full appearance-none rounded-md bg-[var(--info-soft)] pl-2 pr-6 font-mono text-[10px] font-medium text-[var(--info)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--info)]/30"
          >
            {MASK_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-[var(--info)]"
            strokeWidth={2}
          />
        </div>
      )}

      {isOpen && (
        <input
          type="text"
          value={filterDraft}
          onChange={(e) => setFilterDraft(e.target.value)}
          onBlur={commitFilter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            } else if (e.key === "Escape") {
              setFilterDraft(value.row_filter ?? "");
              setExpanded(false);
            }
          }}
          placeholder="row filter (SQL WHERE fragment, optional)"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="h-6 w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-muted)] px-2 font-mono text-[10px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] transition-colors focus-visible:border-[var(--primary)] focus-visible:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      )}
    </div>
  );
}

function MatrixSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <span className="skel h-10 w-[220px]" />
          {Array.from({ length: 5 }).map((_, j) => (
            <span key={j} className="skel h-10 w-[140px]" />
          ))}
        </div>
      ))}
    </div>
  );
}

function MatrixWarning({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-input)] border border-[var(--warning-soft)] bg-[var(--warning-soft)]/40 p-4 text-[13px] m-6">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" strokeWidth={1.75} />
      <div>
        <div className="font-medium text-[var(--warning)]">{title}</div>
        <p className="mt-0.5 text-[var(--fg-muted)]">{message}</p>
      </div>
    </div>
  );
}
