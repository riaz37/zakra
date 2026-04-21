"use client";

import { useEffect, useState } from "react";
import { GitBranch } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Company } from "@/types";
import { StatusBadge } from "./status-badge";
import { OverviewTab } from "./tabs/overview-tab";
import { MembersTab } from "./tabs/members-tab";
import { SubsidiariesTab } from "./tabs/subsidiaries-tab";

interface CompanyDrawerProps {
  company: Company | null;
  open: boolean;
  onClose: () => void;
}

export function CompanyDrawer({ company, open, onClose }: CompanyDrawerProps) {
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (open) setTab("overview");
  }, [open, company?.id]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-[720px]">
        {company ? (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-[var(--border)] px-6 py-5">
              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[var(--primary-soft)] font-display text-[18px] font-semibold text-[var(--primary)]"
                >
                  {company.name[0]?.toUpperCase() ?? "?"}
                </span>
                <div className="min-w-0 grow">
                  <SheetTitle className="font-display text-[18px] font-semibold -tracking-[0.01em]">
                    {company.name}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 font-mono text-[12px] text-[var(--fg-muted)]">
                    {company.slug}
                  </SheetDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={company.status} />
                    {company.company_type === "subsidiary" && (
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius-badge)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                        <GitBranch className="size-2.5" strokeWidth={2} />
                        Subsidiary
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>

            <Tabs
              value={tab}
              onValueChange={(v: string) => setTab(v)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6">
                <TabsList
                  variant="line"
                  className="h-11 w-full justify-start gap-4 rounded-none bg-transparent p-0"
                >
                  <TabsTrigger
                    value="overview"
                    className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
                  >
                    Members
                  </TabsTrigger>
                  <TabsTrigger
                    value="subsidiaries"
                    className="h-11 rounded-none border-0 px-0 text-[13px] font-medium data-active:text-[var(--primary)] after:bg-[var(--primary)]"
                  >
                    Subsidiaries
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <TabsContent value="overview" className="m-0">
                  <OverviewTab company={company} />
                </TabsContent>
                <TabsContent value="members" className="m-0">
                  <MembersTab company={company} />
                </TabsContent>
                <TabsContent value="subsidiaries" className="m-0">
                  <SubsidiariesTab company={company} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
