import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";

export const metadata = {
    title: "Help & Support | DXLR",
    description: "Get help with your orders, returns, and account inquiries.",
};

export default function SupportPage() {
    const supportLinks = [
        {
            title: "About Us",
            description: "Learn more about our story and values",
            icon: "info",
            href: "/about",
            color: "bg-blue-500/20 text-blue-400",
        },
        {
            title: "Contact Us",
            description: "Get in touch with our support team",
            icon: "support_agent",
            href: "/contact",
            color: "bg-green-500/20 text-green-400",
        },
        {
            title: "FAQs",
            description: "Frequently asked questions",
            icon: "help_outline",
            href: "/faqs",
            color: "bg-purple-500/20 text-purple-400",
        },
        {
            title: "Shipping & Delivery",
            description: "Delivery times and shipping costs",
            icon: "local_shipping",
            href: "/shipping",
            color: "bg-orange-500/20 text-orange-400",
        },
        {
            title: "Return & Exchange",
            description: "Our return policy and process",
            icon: "replay",
            href: "/returns",
            color: "bg-red-500/20 text-red-400",
        },
        {
            title: "Privacy Policy",
            description: "How we handle your data",
            icon: "security",
            href: "/privacy",
            color: "bg-gray-500/20 text-gray-400",
        },
    ];

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-brand-cream mb-4">Help & Support</h1>
                    <p className="text-brand-cream/70 max-w-2xl mx-auto">
                        Find answers to your questions or get in touch with us. We're here to help!
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {supportLinks.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors flex items-start gap-4"
                        >
                            <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${link.color} group-hover:scale-110 transition-transform`}
                            >
                                <Icon name={link.icon} className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-brand-cream mb-1 flex items-center gap-2">
                                    {link.title}
                                    <Icon name="arrow_forward" className="text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-bold" />
                                </h3>
                                <p className="text-sm text-brand-cream/60">{link.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-8 text-center">
                    <h2 className="text-xl font-bold text-brand-cream mb-2">Still need help?</h2>
                    <p className="text-brand-cream/70 mb-6">
                        Our support team is available Saturday to Thursday, 10 AM - 10 PM.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                        <Icon name="chat" className="text-xl" />
                        Contact Support
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/account" className="text-brand-cream/50 hover:text-brand-cream text-sm inline-flex items-center gap-1 transition-colors">
                        <Icon name="arrow_back" className="text-sm" />
                        Back to Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
