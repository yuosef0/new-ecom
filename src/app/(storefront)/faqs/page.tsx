import { getPage, getFaqItems } from "@/app/actions/pages";
import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";
import { ClientAccordion } from "@/components/storefront/faqs/ClientAccordion";

type FaqItem = {
    id: string;
    question: string;
    answer: string;
    category: string;
};

export async function generateMetadata() {
    const page = await getPage('faqs');
    return {
        title: `${page?.title || 'Frequently Asked Questions'} | RiLIKS`,
        description: "Quick answers to common questions about our products and services.",
    };
}

export default async function FAQPage() {
    const page = await getPage('faqs');
    const faqItems = await getFaqItems();

    // Group items by category
    const groupedFaqs: { category: string; items: FaqItem[] }[] = [];

    // Define preferred order of categories
    const categoryOrder = ["Orders & Shipping", "Returns & Refunds", "Products & Sizing", "General"];

    if (faqItems) {
        // Grouping logic
        faqItems.forEach(item => {
            const existingGroup = groupedFaqs.find(g => g.category === item.category);
            if (existingGroup) {
                existingGroup.items.push(item);
            } else {
                groupedFaqs.push({ category: item.category, items: [item] });
            }
        });

        // Sort categories
        groupedFaqs.sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.category);
            const indexB = categoryOrder.indexOf(b.category);
            // If both are in the known list, sort by index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is known, it comes first
            if (indexA !== -1) return -1;
            // If only B is known, it comes first
            if (indexB !== -1) return 1;
            // Otherwise sort alphabetically
            return a.category.localeCompare(b.category);
        });
    }

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">{page?.title || 'Frequently Asked Questions'}</h1>
                    <div className="text-xl text-brand-cream/70 max-w-2xl mx-auto"
                        dangerouslySetInnerHTML={{ __html: page?.content || '' }}
                    />
                </div>

                {/* FAQs */}
                <div className="space-y-8">
                    {groupedFaqs.map((section, sIndex) => (
                        <div key={section.category} className="space-y-4">
                            <h2 className="text-xl font-bold text-brand-primary px-2 border-l-4 border-brand-primary">
                                {section.category}
                            </h2>
                            <div className="space-y-3">
                                {section.items.map((item, iIndex) => (
                                    <ClientAccordion
                                        key={item.id}
                                        id={`${sIndex}-${iIndex}`}
                                        question={item.question}
                                        answer={item.answer}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still have questions */}
                <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-8 text-center mt-12">
                    <h3 className="text-xl font-bold text-brand-cream mb-2">Still have questions?</h3>
                    <p className="text-brand-cream/70 mb-6">
                        Can't find the answer you're looking for? Please contact our friendly support team.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>

                {/* Back Link */}
                <div className="text-center pt-4">
                    <Link href="/support" className="inline-flex items-center gap-2 text-brand-cream/60 hover:text-brand-cream transition-colors">
                        <Icon name="arrow_back" className="text-lg" />
                        Back to Support
                    </Link>
                </div>
            </div>
        </div>
    );
}

