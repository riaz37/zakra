import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReportLanguage = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'tr' | 'ur' | 'zh' | 'hi';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  reportLanguage: ReportLanguage;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setReportLanguage: (language: ReportLanguage) => void;
}

type UIStore = UIState & UIActions;

/**
 * Zustand store for UI state management
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      reportLanguage: 'en' as ReportLanguage,

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleMobileSidebar: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
      setMobileSidebarOpen: (open) => set({ sidebarMobileOpen: open }),
      setReportLanguage: (language) => set({ reportLanguage: language }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        reportLanguage: state.reportLanguage,
      }),
    }
  )
);
