import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarCollapsed: boolean;
  selectedRepoId: string | null;
  toggleSidebar: () => void;
  setSelectedRepo: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      selectedRepoId: '1',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSelectedRepo: (id) => set({ selectedRepoId: id }),
    }),
    { name: 'codemind-app', partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, selectedRepoId: s.selectedRepoId }) },
  ),
);
