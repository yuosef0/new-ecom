import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";

export const metadata = {
    title: "Shipping & Delivery | DXLR",
    description: "Information about shipping methods, delivery times, and costs.",
};

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">Shipping & Delivery</h1>
                    <p className="text-xl text-brand-cream/70 max-w-2xl mx-auto">
                        Everything you need to know about getting your order.
                    </p>
                </div>

                {/* Delivery Options */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                                <Icon name="local_shipping" className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-cream">Standard Delivery</h3>
                        </div>
                        <ul className="space-y-3 text-brand-cream/80">
                            <li className="flex items-start gap-2">
                                <Icon name="check_circle" className="text-green-500 text-lg mt-1" />
                                <span>Cairo & Giza: 2-3 business days</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Icon name="check_circle" className="text-green-500 text-lg mt-1" />
                                <span>Other Governorates: 3-5 business days</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Icon name="check_circle" className="text-green-500 text-lg mt-1" />
                                <span>Free shipping on orders over 2000 EGP</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center">
                                <Icon name="rocket_launch" className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-cream">Express Delivery</h3>
                        </div>
                        <ul className="space-y-3 text-brand-cream/80">
                            <li className="flex items-start gap-2">
                                <Icon name="check_circle" className="text-green-500 text-lg mt-1" />
                                <span>Cairo Only</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Icon name="check_circle" className="text-green-500 text-lg mt-1" />
                                <span>Same day delivery (Order before 12 PM)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Icon name="check_circle" className="text-green-500 text-lg mt-1" />
                                <span>Extra fee applies</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Shipping Rates */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
                        <Icon name="payments" className="text-2xl" />
                        Shipping Rates
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-brand-cream/80">
                            <thead className="bg-white/5 text-brand-cream font-bold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4 rounded-tl-lg">Region</th>
                                    <th className="p-4">Standard Shipping</th>
                                    <th className="p-4 rounded-tr-lg">Express Shipping</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                <tr>
                                    <td className="p-4">Cairo & Giza</td>
                                    <td className="p-4">50 EGP</td>
                                    <td className="p-4">100 EGP</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Alexandria & Delta</td>
                                    <td className="p-4">70 EGP</td>
                                    <td className="p-4">N/A</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Upper Egypt</td>
                                    <td className="p-4">90 EGP</td>
                                    <td className="p-4">N/A</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section Reference */}
                <div className="text-center">
                    <p className="text-brand-cream/70 mb-4">
                        Have more questions about shipping? Check our FAQs or contact us.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/faqs" className="text-brand-primary hover:underline font-medium">
                            View FAQs
                        </Link>
                        <span className="text-brand-cream/30">|</span>
                        <Link href="/contact" className="text-brand-primary hover:underline font-medium">
                            Contact Support
                        </Link>
                    </div>
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
