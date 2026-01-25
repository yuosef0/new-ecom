"use client";

import { useAdminTheme } from "@/stores/adminTheme";
import { useEffect } from "react";

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
    const { isDark } = useAdminTheme();

    useEffect(() => {
        // Apply dark class to admin wrapper
        const adminWrapper = document.getElementById('admin-wrapper');
        if (adminWrapper) {
            if (isDark) {
                adminWrapper.classList.add('dark');
            } else {
                adminWrapper.classList.remove('dark');
            }
        }
    }, [isDark]);

    return <>{children}</>;
}
