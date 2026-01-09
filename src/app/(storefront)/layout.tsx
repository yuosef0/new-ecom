import { Header } from "@/components/storefront/layout/Header";
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
    <div className="min-h-screen bg-brand-burgundy">
      <div className="max-w-md mx-auto relative">
        {/* Free Shipping Banner */}
        <div className="bg-brand-cream py-2 sm:py-3 text-center px-4">
          <p className="text-brand-charcoal font-bold text-xs sm:text-sm tracking-wider">
            FREE SHIPPING ON All Orders
          </p>
        </div>

        <Header />
        <main>{children}</main>
        <BottomNav />
        <SideMenu />
        <CartOverlay />
        <SearchOverlay />
      </div>
    </div>
  );
}
