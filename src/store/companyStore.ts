import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyStore {
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string) => void;
  clearSelectedCompany: () => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      selectedCompanyId: null,
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
      clearSelectedCompany: () => set({ selectedCompanyId: null }),
    }),
    { name: 'company-context' },
  ),
);
