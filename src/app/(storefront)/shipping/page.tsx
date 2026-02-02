import { getPage } from "@/app/actions/pages";
import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";
import { notFound } from "next/navigation";

export async function generateMetadata() {
    const page = await getPage('shipping');
    return {
        title: `${page?.title || 'Shipping & Delivery'} | RiLIKS`,
        description: "Information about shipping methods, delivery times, and costs.",
    };
}

export default async function ShippingPage() {
    const page = await getPage('shipping');

    if (!page) notFound();

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">{page.title}</h1>
                </div>

                {/* Content */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-brand-cream/80 space-y-6"
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                />

                {/* FAQ Section Reference - Kept as footer */}
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


