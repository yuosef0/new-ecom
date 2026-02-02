"use client";

import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";
import { getPage } from "@/app/actions/pages";
import { ContactForm } from "@/components/storefront/contact/ContactForm"; // We'll need to move the form logic

export default async function ContactPage() {



    const page = await getPage('contact');

    // Default values if no data or parse error
    let contactInfo = {
        whatsapp: "+20 100 000 0000",
        email: "support@riliks.com",
        address: "123 Fashion Avenue\nCairo, Egypt"
    };

    if (page && page.content && page.content.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(page.content);
            contactInfo = {
                whatsapp: parsed.whatsapp || contactInfo.whatsapp,
                email: parsed.email || contactInfo.email,
                address: parsed.address || contactInfo.address
            };
        } catch (e) {
            // Ignore parse error, use defaults
        }
    }

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-brand-cream mb-4">{page?.title || "Get in Touch"}</h1>
                        <p className="text-brand-cream/70 text-lg">
                            Have questions about your order or need style advice? We're here to help.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 bg-brand-primary/20 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                                <Icon name="email" className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-brand-cream">Email Us</h3>
                                <p className="text-brand-cream/60 text-sm mb-1">
                                    We'll respond within 24 hours
                                </p>
                                <a href={`mailto:${contactInfo.email}`} className="text-brand-primary hover:underline">
                                    {contactInfo.email}
                                </a>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center shrink-0">
                                <Icon name="phone" className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-brand-cream">Call / WhatsApp</h3>
                                <p className="text-brand-cream/60 text-sm mb-1">
                                    Sat-Thu from 10am to 10pm
                                </p>
                                <a href={`tel:${contactInfo.whatsapp}`} className="text-brand-primary hover:underline">
                                    {contactInfo.whatsapp}
                                </a>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center shrink-0">
                                <Icon name="location_on" className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-brand-cream">Visit Us</h3>
                                <p className="text-brand-cream/60 text-sm whitespace-pre-line">
                                    {contactInfo.address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-brand-cream mb-6">Send us a Message</h2>
                    <ContactForm />
                </div>
            </div>

            {/* Back Link */}
            <div className="text-center pt-12">
                <Link href="/support" className="inline-flex items-center gap-2 text-brand-cream/60 hover:text-brand-cream transition-colors">
                    <Icon name="arrow_back" className="text-lg" />
                    Back to Support
                </Link>
            </div>
        </div>
    );
}
