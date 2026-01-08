import { BottomNav } from "@/components/storefront/layout/BottomNav";
import { SideMenu } from "@/components/storefront/layout/SideMenu";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Side Menu Drawer */}
      <SideMenu />

      {/* Main Content */}
      <div className="mx-auto max-w-sm min-h-screen">
        <main className="pb-24">{children}</main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
