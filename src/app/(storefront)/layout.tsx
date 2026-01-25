import { Header } from "@/components/storefront/layout/Header";
import { Footer } from "@/components/storefront/layout/Footer";
import { BottomNav } from "@/components/storefront/layout/BottomNav";
import { SideMenu } from "@/components/storefront/layout/SideMenu";
import { CartOverlay } from "@/components/storefront/cart/CartOverlay";
import { SearchOverlay } from "@/components/storefront/search/SearchOverlay";
import { TopBarMessages } from "@/components/storefront/TopBarMessages";
import { ScrollToTopButton } from "@/components/storefront/ui/ScrollToTopButton";
import { createClient } from "@/lib/supabase/server";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch top bar messages
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("top_bar_messages")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return (
    <div className="min-h-screen bg-brand-burgundy">
      <div className="w-full relative bg-brand-burgundy min-h-screen">
        {/* Top Bar Messages with Rotation */}
        <TopBarMessages messages={messages || []} />

        <Header />
        <main>{children}</main>
        <Footer />
        <div className="md:hidden">
          <BottomNav />
        </div>
        <SideMenu />
        <CartOverlay />
        <SearchOverlay />
        <ScrollToTopButton />
      </div>
    </div>
  );
}
