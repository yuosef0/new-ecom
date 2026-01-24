"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminHeaderProps {
  user: {
    email: string;
    full_name?: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-10">
      <div className="h-full flex items-center justify-between px-6">
        {/* Mobile menu button */}
        <button className="lg:hidden p-2 text-gray-600 hover:text-brand-primary">
          <span className="material-icons-outlined">menu</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-brand-primary relative">
            <span className="material-icons-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-semibold text-gray-900">
                {user.full_name || user.email.split("@")[0]}
              </span>
              <span className="material-icons-outlined text-gray-700 text-sm">
                {dropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border-2 border-gray-300 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-300">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.full_name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-700">{user.email}</p>
                </div>
                <button
                  onClick={() => router.push("/admin/settings")}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                >
                  <span className="material-icons-outlined text-lg">settings</span>
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <span className="material-icons-outlined text-lg">logout</span>
                  {loading ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
