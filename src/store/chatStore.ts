/**
 * Zustand store for chat UI state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  selectedCompanyId: string | null;
  selectedConnectionId: string | null;
  chatSidebarOpen: boolean;
}

interface ChatActions {
  setSelectedCompanyId: (id: string | null) => void;
  setSelectedConnectionId: (id: string | null) => void;
  setChatSidebarOpen: (open: boolean) => void;
  toggleChatSidebar: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      selectedCompanyId: null,
      selectedConnectionId: null,
      chatSidebarOpen: true,

      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
      setSelectedConnectionId: (id) => set({ selectedConnectionId: id }),
      setChatSidebarOpen: (open) => set({ chatSidebarOpen: open }),
      toggleChatSidebar: () =>
        set((state) => ({ chatSidebarOpen: !state.chatSidebarOpen })),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        selectedCompanyId: state.selectedCompanyId,
        selectedConnectionId: state.selectedConnectionId,
        chatSidebarOpen: state.chatSidebarOpen,
      }),
    },
  ),
);
