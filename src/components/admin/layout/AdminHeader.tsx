"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAdminSidebar } from "@/stores/adminSidebar";
import { useNotifications, Notification } from "@/stores/notifications";
import Link from "next/link";
import { useAdminTheme } from "@/stores/adminTheme";

interface AdminHeaderProps {
  user: {
    email: string;
    full_name?: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toggle } = useAdminSidebar();
  const { isDark, toggle: toggleTheme } = useAdminTheme();
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotifications();

  // Load low stock notifications on mount
  useEffect(() => {
    async function loadLowStockProducts() {
      const supabase = createClient();

      const { data: variants } = await supabase
        .from("product_variants")
        .select(`
          id,
          stock_quantity,
          products!inner(id, name, slug)
        `)
        .lte("stock_quantity", 5)
        .gt("stock_quantity", 0);

      const { data: outOfStock } = await supabase
        .from("product_variants")
        .select(`
          id,
          stock_quantity,
          products!inner(id, name, slug)
        `)
        .eq("stock_quantity", 0);

      const newNotifications: Notification[] = [];

      // Low stock notifications
      if (variants && variants.length > 0) {
        // Group by product
        const productMap = new Map<string, { name: string; slug: string; totalStock: number }>();
        variants.forEach((v: any) => {
          const existing = productMap.get(v.products.id);
          if (existing) {
            existing.totalStock += v.stock_quantity;
          } else {
            productMap.set(v.products.id, {
              name: v.products.name,
              slug: v.products.slug,
              totalStock: v.stock_quantity,
            });
          }
        });

        productMap.forEach((product, productId) => {
          newNotifications.push({
            id: `low-${productId}`,
            type: 'low_stock',
            title: 'Low Stock Warning',
            message: `${product.name} - Only ${product.totalStock} left`,
            link: `/admin/products/${productId}`,
            read: false,
            createdAt: new Date(),
          });
        });
      }

      // Out of stock notifications
      if (outOfStock && outOfStock.length > 0) {
        const productMap = new Map<string, { name: string; slug: string }>();
        outOfStock.forEach((v: any) => {
          productMap.set(v.products.id, {
            name: v.products.name,
            slug: v.products.slug,
          });
        });

        productMap.forEach((product, productId) => {
          newNotifications.push({
            id: `out-${productId}`,
            type: 'out_of_stock',
            title: 'Out of Stock',
            message: `${product.name} is out of stock`,
            link: `/admin/products/${productId}`,
            read: false,
            createdAt: new Date(),
          });
        });
      }

      setNotifications(newNotifications);
    }

    loadLowStockProducts();
  }, [setNotifications]);

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      case 'new_order': return 'shopping_bag';
      default: return 'info';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'low_stock': return 'text-yellow-600';
      case 'out_of_stock': return 'text-red-600';
      case 'new_order': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-10">
      <div className="h-full flex items-center justify-between px-4 sm:px-6">
        {/* Mobile menu button */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="material-icons-outlined">menu</span>
        </button>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center">
          <span className="text-xl font-bold text-brand-primary">RiLIKS</span>
          <span className="ml-1 text-xs text-gray-500">Admin</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className="material-icons-outlined">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setDropdownOpen(false);
              }}
              className="p-2 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <span className="material-icons-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-brand-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <span className="material-icons-outlined text-4xl text-gray-300 mb-2">notifications_none</span>
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            href={notification.link || '#'}
                            onClick={() => {
                              markAsRead(notification.id);
                              setNotificationsOpen(false);
                            }}
                            className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`material-icons-outlined text-xl ${getNotificationColor(notification.type)}`}>
                                {getNotificationIcon(notification.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-gray-900">
                {user.full_name || user.email.split("@")[0]}
              </span>
              <span className="hidden sm:block material-icons-outlined text-gray-700 text-sm">
                {dropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* User Dropdown */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border-2 border-gray-300 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-300">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.full_name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-700">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/admin/settings");
                    }}
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
