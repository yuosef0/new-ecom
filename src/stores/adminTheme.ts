import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminThemeState {
    isDark: boolean;
    toggle: () => void;
    setDark: (isDark: boolean) => void;
}

export const useAdminTheme = create<AdminThemeState>()(
    persist(
        (set) => ({
            isDark: false,
            toggle: () => set((state) => ({ isDark: !state.isDark })),
            setDark: (isDark) => set({ isDark }),
        }),
        {
            name: 'admin-theme',
        }
    )
);
