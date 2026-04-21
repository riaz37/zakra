"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { useCompanies } from "@/hooks/useCompanies";
import { CompaniesGrid } from "./_components/companies-grid";
import { CompanyDrawer } from "./_components/company-drawer";
import { CreateCompanyDialog } from "./_components/create-company-dialog";

export default function CompaniesPage() {
  const companies = useCompanies({ page: 1, page_size: 60 });
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const selected = useMemo(
    () => companies.data?.items.find((c) => c.id === detailId) ?? null,
    [companies.data, detailId],
  );

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Companies"
        subtitle={
          companies.data
            ? `${companies.data.total.toLocaleString()} in your tenancy`
            : "Tenants using this workspace"
        }
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="size-[14px]" strokeWidth={1.75} />
            New company
          </button>
        }
      />

      <CompaniesGrid
        isLoading={companies.isLoading}
        items={companies.data?.items}
        onOpen={(id) => setDetailId(id)}
        onCreate={() => setCreateOpen(true)}
      />

      <CreateCompanyDialog open={createOpen} onOpenChange={setCreateOpen} />

      <CompanyDrawer
        company={selected}
        open={!!selected}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
