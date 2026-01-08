import { BottomNav } from "@/components/storefront/layout/BottomNav";
import { SideMenu } from "@/components/storefront/layout/SideMenu";
import { CartOverlay } from "@/components/storefront/cart/CartOverlay";
import { SearchOverlay } from "@/components/storefront/search/SearchOverlay";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Side Menu Drawer */}
      <SideMenu />

      {/* Cart Overlay */}
      <CartOverlay />

      {/* Search Overlay */}
      <SearchOverlay />

      {/* Main Content */}
      <div className="mx-auto max-w-sm min-h-screen">
        <main className="pb-24">{children}</main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
