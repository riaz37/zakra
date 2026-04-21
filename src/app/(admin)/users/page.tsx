"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { useUsers } from "@/hooks/useUsers";
import { useCurrentCompanyId } from "@/hooks/useCurrentCompany";
import { useDebounce } from "@/hooks/useDebounce";
import type { User } from "@/types";
import { DeleteUserDialog } from "./_components/delete-user-dialog";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import { UserDetailSheet } from "./_components/user-detail-sheet";
import { UsersTable } from "./_components/users-table";
import { UsersToolbar } from "./_components/users-toolbar";

export default function UsersPage() {
  const companyId = useCurrentCompanyId();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 250);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const list = useUsers({
    company_id: companyId,
    page,
    page_size: pageSize,
    search: search || undefined,
  });

  const total = list.data?.total ?? 0;
  const totalPages = list.data?.total_pages ?? 1;

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Users"
        subtitle={
          total > 0
            ? `${total.toLocaleString()} ${total === 1 ? "user" : "users"} in your workspace`
            : "Invite teammates to collaborate in your workspace"
        }
        actions={
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="size-[14px]" strokeWidth={1.75} />
            Invite user
          </button>
        }
      />

      <UsersToolbar
        searchRaw={searchRaw}
        onSearchChange={setSearchRaw}
        page={page}
        totalPages={totalPages}
        isFetching={list.isFetching}
        isLoading={list.isLoading}
      />

      <UsersTable
        isLoading={list.isLoading}
        users={list.data?.items}
        search={search}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onOpen={setDetailUserId}
        onDelete={setDeleteUser}
        onInvite={() => setInviteOpen(true)}
        onPageChange={setPage}
      />

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        companyId={companyId}
      />

      <UserDetailSheet
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />

      <DeleteUserDialog
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
      />
    </div>
  );
}
