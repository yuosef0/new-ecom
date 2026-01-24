import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DebugOrdersPage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get ALL orders (for debugging)
    const { data: allOrders } = await supabase
        .from("orders")
        .select("id, order_number, user_id, guest_email, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

    // Get user's orders
    const { data: userOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-brand-dark py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-brand-cream mb-6">Debug: Orders</h1>

                {/* Current User Info */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-brand-cream mb-4">Current User</h2>
                    <div className="space-y-2 text-sm">
                        <p className="text-brand-cream">
                            <strong>User ID:</strong> {user.id}
                        </p>
                        <p className="text-brand-cream">
                            <strong>Email:</strong> {user.email}
                        </p>
                    </div>
                </div>

                {/* User's Orders */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-brand-cream mb-4">
                        Your Orders ({userOrders?.length || 0})
                    </h2>
                    {userOrders && userOrders.length > 0 ? (
                        <div className="space-y-2">
                            {userOrders.map((order: any) => (
                                <div key={order.id} className="text-sm text-brand-cream/80 border-b border-white/10 pb-2">
                                    <p><strong>{order.order_number}</strong> - {order.status} - {order.total} EGP</p>
                                    <p className="text-xs text-brand-cream/60">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-brand-cream/60">No orders found for your account</p>
                    )}
                </div>

                {/* All Orders (Debug) */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-brand-cream mb-4">
                        All Recent Orders (Debug)
                    </h2>
                    {allOrders && allOrders.length > 0 ? (
                        <div className="space-y-2">
                            {allOrders.map((order: any) => (
                                <div key={order.id} className="text-sm text-brand-cream/80 border-b border-white/10 pb-2">
                                    <p>
                                        <strong>{order.order_number}</strong>
                                    </p>
                                    <p className="text-xs text-brand-cream/60">
                                        User ID: {order.user_id || 'Guest'}
                                    </p>
                                    <p className="text-xs text-brand-cream/60">
                                        Email: {order.guest_email || 'N/A'}
                                    </p>
                                    <p className="text-xs text-brand-cream/60">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                    {order.user_id === user.id && (
                                        <p className="text-xs text-green-400">✅ This is your order</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-brand-cream/60">No orders found</p>
                    )}
                </div>
            </div>
        </div>
    );
}
