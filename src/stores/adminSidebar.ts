import { create } from 'zustand';

interface AdminSidebarState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export const useAdminSidebar = create<AdminSidebarState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
