import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Global state stored Zustand (để sử dụng nhiều nơi)

interface GlobalState {
  expandedPlayer: boolean;
  setExpandedPlayer: (expanded: boolean) => void;
}

const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      (set) => ({
        expandedPlayer: false,
        setExpandedPlayer: (expanded) => set({ expandedPlayer: expanded }),
      }),
      {
        name: 'global-storage',
      }
    )
  )
);

export default useGlobalStore;
