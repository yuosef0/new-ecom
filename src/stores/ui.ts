import { create } from "zustand";

interface UIState {
  searchOpen: boolean;
  filterOpen: boolean;
  menuOpen: boolean;

  toggleSearch: () => void;
  toggleFilter: () => void;
  toggleMenu: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  filterOpen: false,
  menuOpen: false,

  toggleSearch: () =>
    set((state) => ({
      searchOpen: !state.searchOpen,
      filterOpen: false,
      menuOpen: false,
    })),

  toggleFilter: () =>
    set((state) => ({
      filterOpen: !state.filterOpen,
      searchOpen: false,
      menuOpen: false,
    })),

  toggleMenu: () =>
    set((state) => ({
      menuOpen: !state.menuOpen,
      searchOpen: false,
      filterOpen: false,
    })),

  closeAll: () =>
    set({
      searchOpen: false,
      filterOpen: false,
      menuOpen: false,
    }),
}));
