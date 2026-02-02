import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";

export const metadata = {
    title: "Return & Exchange | RiLIKS",
    description: "Learn about our return and exchange policy.",
};

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">Return & Exchange</h1>
                    <p className="text-xl text-brand-cream/70 max-w-2xl mx-auto">
                        We want you to love what you ordered. If something isn't right, let us know.
                    </p>
                </div>

                {/* Policy Highlights */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                            <Icon name="calendar_today" className="text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-cream">14 Days Window</h3>
                        <p className="text-brand-cream/60 text-sm">
                            You have 14 days from the delivery date to request a return.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                            <Icon name="checkroom" className="text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-cream">Original Condition</h3>
                        <p className="text-brand-cream/60 text-sm">
                            Items must be unworn, unwashed, and with all original tags attached.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                            <Icon name="published_with_changes" className="text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-cream">Easy Exchange</h3>
                        <p className="text-brand-cream/60 text-sm">
                            Size didn't fit? We offer free exchanges for size replacements.
                        </p>
                    </div>
                </div>

                {/* Process Steps */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
                    <h2 className="text-2xl font-bold text-brand-cream text-center mb-8">How to Return?</h2>

                    <div className="space-y-8 relative before:absolute before:left-[19px] md:before:left-1/2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                        {/* Step 1 */}
                        <div className="relative flex md:justify-center items-start gap-8 md:gap-0">
                            <div className="md:w-1/2 md:pr-12 md:text-right hidden md:block">
                                <h3 className="text-xl font-bold text-brand-primary mb-2">Request Return</h3>
                                <p className="text-brand-cream/70">Go to "My Orders" in your account, select the order, and click "Return Item".</p>
                            </div>
                            <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-10 h-10 bg-brand-burgundy border-4 border-brand-dark rounded-full flex items-center justify-center z-10 font-bold text-brand-cream shadow-lg">1</div>
                            <div className="pl-12 md:pl-12 md:w-1/2">
                                <div className="md:hidden">
                                    <h3 className="text-xl font-bold text-brand-primary mb-2">Request Return</h3>
                                    <p className="text-brand-cream/70 mb-4">Go to "My Orders" in your account, select the order, and click "Return Item".</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex md:justify-center items-start gap-8 md:gap-0">
                            <div className="md:w-1/2 md:pr-12 md:text-right hidden md:block">
                            </div>
                            <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-10 h-10 bg-brand-burgundy border-4 border-brand-dark rounded-full flex items-center justify-center z-10 font-bold text-brand-cream shadow-lg">2</div>
                            <div className="pl-12 md:pl-12 md:w-1/2">
                                <h3 className="text-xl font-bold text-brand-primary mb-2">Prepare Package</h3>
                                <p className="text-brand-cream/70">Pack the items securely in the original packaging if possible.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex md:justify-center items-start gap-8 md:gap-0">
                            <div className="md:w-1/2 md:pr-12 md:text-right hidden md:block">
                                <h3 className="text-xl font-bold text-brand-primary mb-2">Courier Pickup</h3>
                                <p className="text-brand-cream/70">Our courier partner will contact you within 24-48 hours to schedule a pickup.</p>
                            </div>
                            <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-10 h-10 bg-brand-burgundy border-4 border-brand-dark rounded-full flex items-center justify-center z-10 font-bold text-brand-cream shadow-lg">3</div>
                            <div className="pl-12 md:pl-12 md:w-1/2">
                                <div className="md:hidden">
                                    <h3 className="text-xl font-bold text-brand-primary mb-2">Courier Pickup</h3>
                                    <p className="text-brand-cream/70 mb-4">Our courier partner will contact you within 24-48 hours to schedule a pickup.</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex md:justify-center items-start gap-8 md:gap-0">
                            <div className="md:w-1/2 md:pr-12 md:text-right hidden md:block">
                            </div>
                            <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-10 h-10 bg-brand-burgundy border-4 border-brand-dark rounded-full flex items-center justify-center z-10 font-bold text-brand-cream shadow-lg">4</div>
                            <div className="pl-12 md:pl-12 md:w-1/2">
                                <h3 className="text-xl font-bold text-brand-primary mb-2">Refund Processed</h3>
                                <p className="text-brand-cream/70">Once verified, your refund will be processed within 5 business days.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Non-returnable items */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                        <Icon name="warning" className="text-xl" />
                        Non-returnable Items
                    </h3>
                    <ul className="list-disc list-inside text-brand-cream/70 space-y-1 ml-1">
                        <li>Accessories (Jewelry, Scarves, etc.) for hygiene reasons.</li>
                        <li>Underwear and Swimwear.</li>
                        <li>Items marked as "Final Sale".</li>
                    </ul>
                </div>

                {/* Back Link */}
                <div className="text-center pt-8">
                    <Link href="/support" className="inline-flex items-center gap-2 text-brand-cream/60 hover:text-brand-cream transition-colors">
                        <Icon name="arrow_back" className="text-lg" />
                        Back to Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
