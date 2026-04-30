'use client';

import { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { useCompanyStore } from '@/store/companyStore';
import { useCompanies } from '@/hooks/useCompanies';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompanySwitcherProps {
  collapsed?: boolean;
}

export function CompanySwitcher({ collapsed = false }: CompanySwitcherProps) {
  const { data, isLoading } = useCompanies({ page_size: 100 });
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const setSelectedCompanyId = useCompanyStore((s) => s.setSelectedCompanyId);

  const companies = data?.items ?? [];
  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId),
    [companies, selectedCompanyId],
  );

  if (collapsed) {
    const selected = companies.find((c) => c.id === selectedCompanyId);
    return (
      <div className="flex justify-center px-2 pb-3">
        <span
          title={selected?.name ?? 'No company selected'}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-300 text-muted"
        >
          <Building2 size={14} strokeWidth={1.75} />
        </span>
      </div>
    );
  }

  return (
    <div className="px-3 pb-3">
      <p
        className="mb-1.5 px-1 font-sans text-micro uppercase text-subtle tracking-[0.048px]"
      >
        Active company
      </p>

      <Select
        value={selectedCompanyId ?? ''}
        onValueChange={(val) => {
          if (val) setSelectedCompanyId(val);
        }}
      >
        <SelectTrigger
          className="w-full truncate"
          disabled={isLoading}
        >
          <SelectValue placeholder="Select a company…">
            {selectedCompany?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          side="bottom"
          sideOffset={4}
          alignItemWithTrigger={false}
          className="w-[var(--anchor-width)] min-w-[200px]"
        >
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
