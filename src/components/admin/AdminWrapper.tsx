"use client";

import { useAdminTheme } from "@/stores/adminTheme";

interface AdminWrapperProps {
    children: React.ReactNode;
}

export function AdminWrapper({ children }: AdminWrapperProps) {
    const { isDark } = useAdminTheme();

    return (
        <div id="admin-wrapper" className={isDark ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                {children}
            </div>
        </div>
    );
}
