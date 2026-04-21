"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { useRoles } from "@/hooks/useRoles";
import type { Role } from "@/types";
import { CreateRoleDialog } from "./_components/create-role-dialog";
import { DeleteRoleDialog } from "./_components/delete-role-dialog";
import { EditRoleDialog } from "./_components/edit-role-dialog";
import { PermissionMatrix } from "./_components/permission-matrix";
import { RolesList } from "./_components/roles-list";

export default function RolesPage() {
  const roles = useRoles({ page: 1, page_size: 100 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  // Default to first role once loaded
  useEffect(() => {
    if (!selectedId && roles.data?.items.length) {
      setSelectedId(roles.data.items[0].id);
    }
  }, [roles.data, selectedId]);

  const selectedRole = useMemo(
    () => roles.data?.items.find((r) => r.id === selectedId) ?? null,
    [roles.data, selectedId],
  );

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Roles"
        subtitle="Define what each role can do and who inherits it"
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="size-[14px]" strokeWidth={1.75} />
            New role
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <RolesList
          roles={roles.data?.items ?? []}
          total={roles.data?.total ?? 0}
          isLoading={roles.isLoading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onEdit={setEditRole}
          onDelete={setDeleteRole}
        />

        <section className="min-w-0">
          {selectedRole ? (
            <PermissionMatrix role={selectedRole} />
          ) : (
            <div className="flex h-[60vh] items-center justify-center rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
              <div>
                <div className="mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                  <ShieldCheck className="size-[18px]" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-[16px] font-semibold -tracking-[0.01em]">
                  Select a role
                </h3>
                <p className="mt-1 text-[13px] text-[var(--fg-subtle)]">
                  Pick a role from the list to edit its permissions.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditRoleDialog
        role={editRole}
        onClose={() => setEditRole(null)}
      />
      <DeleteRoleDialog
        role={deleteRole}
        onClose={() => setDeleteRole(null)}
        onDeleted={(id) => {
          if (id === selectedId) setSelectedId(null);
        }}
      />
    </div>
  );
}
