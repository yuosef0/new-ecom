"use client";

import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";
import { useState } from "react";

const faqs = [
    {
        category: "Orders & Shipping",
        items: [
            {
                question: "How do I track my order?",
                answer: "Once your order is shipped, you will receive an email and SMS with a tracking number. You can also track it directly from the 'My Orders' section in your account."
            },
            {
                question: "How long does delivery take?",
                answer: "Standard delivery within Cairo takes 2-3 business days. For other governorates, it usually takes 3-5 business days."
            },
            {
                question: "Do you ship internationally?",
                answer: "Currently, we only ship within Egypt. We plan to expand internationally soon."
            }
        ]
    },
    {
        category: "Returns & Refunds",
        items: [
            {
                question: "What is your return policy?",
                answer: "We offer a 14-day return policy for unworn items in their original condition with tags attached. Sale items are final sale."
            },
            {
                question: "How do I request a return?",
                answer: "Go to 'My Orders', select the order, and click 'Request Return'. Our courier will pick up the item within 48 hours."
            },
            {
                question: "When will I get my refund?",
                answer: "Refunds are processed within 5-7 business days after we receive and inspect the returned item."
            }
        ]
    },
    {
        category: "Products & Sizing",
        items: [
            {
                question: "How do I know my size?",
                answer: "Check our Size Guide linked on every product page. If you're unsure, feel free to contact our support team for advice."
            },
            {
                question: "Are your products authentic?",
                answer: "Yes, all our products are 100% authentic and sourced directly from manufacturers or authorized distributors."
            }
        ]
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">Frequently Asked Questions</h1>
                    <p className="text-xl text-brand-cream/70 max-w-2xl mx-auto">
                        Quick answers to common questions about our products and services.
                    </p>
                </div>

                {/* FAQs */}
                <div className="space-y-8">
                    {faqs.map((section, sIndex) => (
                        <div key={section.category} className="space-y-4">
                            <h2 className="text-xl font-bold text-brand-primary px-2 border-l-4 border-brand-primary">
                                {section.category}
                            </h2>
                            <div className="space-y-3">
                                {section.items.map((item, iIndex) => {
                                    const id = `${sIndex}-${iIndex}`;
                                    const isOpen = openIndex === id;

                                    return (
                                        <div
                                            key={iIndex}
                                            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-colors hover:bg-white/10"
                                        >
                                            <button
                                                onClick={() => toggleAccordion(id)}
                                                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                            >
                                                <span className="font-semibold text-brand-cream text-lg">{item.question}</span>
                                                <Icon
                                                    name="expand_more"
                                                    className={`text-2xl text-brand-cream/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48' : 'max-h-0'
                                                    }`}
                                            >
                                                <div className="p-5 pt-0 text-brand-cream/70 leading-relaxed border-t border-white/5 mx-5 mt-2">
                                                    {item.answer}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
