"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminSidebar } from "@/stores/adminSidebar";

const navigation = [
  {
    section: "Main",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: "dashboard",
      },
    ],
  },
  {
    section: "Catalog",
    items: [
      {
        name: "Products",
        href: "/admin/products",
        icon: "inventory_2",
      },
      {
        name: "Collections",
        href: "/admin/collections",
        icon: "collections",
      },
    ],
  },
  {
    section: "Sales",
    items: [
      {
        name: "Orders",
        href: "/admin/orders",
        icon: "shopping_bag",
      },
      {
        name: "Customers",
        href: "/admin/customers",
        icon: "people",
      },
      {
        name: "Coupons",
        href: "/admin/coupons",
        icon: "local_offer",
      },
      {
        name: "Free Shipping",
        href: "/admin/free-shipping",
        icon: "local_shipping",
      },
    ],
  },
  {
    section: "Content",
    items: [
      {
        name: "Hero Image",
        href: "/admin/hero-image",
        icon: "wallpaper",
      },
      {
        name: "Marquee Banner",
        href: "/admin/marquee-banner",
        icon: "view_carousel",
      },
      {
        name: "Top Bar Messages",
        href: "/admin/top-bar-messages",
        icon: "chat",
      },
    ],
  },
  {
    section: "Settings",
    items: [
      {
        name: "Sale Timer",
        href: "/admin/sale-timer",
        icon: "schedule",
      },
      {
        name: "Social Media",
        href: "/admin/social-media",
        icon: "share",
      },
      {
        name: "General Settings",
        href: "/admin/settings",
        icon: "settings",
      },
    ],
  },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center" onClick={onLinkClick}>
          <span className="text-2xl font-bold text-brand-primary">RiLIKS</span>
          <span className="ml-2 text-xs text-gray-500">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.section}>
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="material-icons-outlined text-xl">
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-brand-primary transition-colors"
        >
          <span className="material-icons-outlined text-xl">storefront</span>
          Back to Store
        </Link>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const { isOpen, close } = useAdminSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={close}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
        >
          <span className="material-icons-outlined">close</span>
        </button>

        <SidebarContent onLinkClick={close} />
      </aside>
    </>
  );
}
