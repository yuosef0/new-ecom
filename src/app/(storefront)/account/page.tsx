import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";
import { SignOutButton } from "@/components/storefront/auth/SignOutButton";

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get basic profile info (optional - if you have a profiles table)
    // const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-brand-cream mb-2">My Account</h1>
                    <p className="text-brand-cream/70">Manage your account and view your orders</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* User Profile Card */}
                    <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                            <Icon name="person" className="text-3xl" />
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <h2 className="text-xl font-semibold text-brand-cream">
                                {user.email?.split('@')[0] || "User"}
                            </h2>
                            <p className="text-brand-cream/60">{user.email}</p>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                    Active Member
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <SignOutButton className="px-4 py-2 bg-white/5 hover:bg-white/10 text-brand-cream rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2" />
                        </div>
                    </div>

                    {/* Quick Links Grid */}
                    {/* Orders */}
                    <Link
                        href="/orders"
                        className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors flex flex-col items-center text-center sm:items-start sm:text-left"
                    >
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                            <Icon name="receipt_long" className="text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-brand-cream mb-1">My Orders</h3>
                        <p className="text-sm text-brand-cream/60">
                            Track your active orders and view history
                        </p>
                    </Link>

                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors flex flex-col items-center text-center sm:items-start sm:text-left"
                    >
                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform">
                            <Icon name="favorite" className="text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-brand-cream mb-1">Wishlist</h3>
                        <p className="text-sm text-brand-cream/60">
                            View and manage your saved items
                        </p>
                    </Link>

                    {/* Support / Contact */}
                    <Link
                        href="/support"
                        className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors flex flex-col items-center text-center sm:items-start sm:text-left"
                    >
                        <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-110 transition-transform">
                            <Icon name="support_agent" className="text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-brand-cream mb-1">Help & Support</h3>
                        <p className="text-sm text-brand-cream/60">
                            Need help? Contact our support team
                        </p>
                    </Link>
                </div>

                <div className="mt-8 text-center sm:text-left">
                    <Link href="/" className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium inline-flex items-center gap-1">
                        <Icon name="arrow_back" className="text-base" />
                        Back to Shop
                    </Link>
                </div>
            </div>
        </div>
    );
}
