

import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";
import { getPage } from "@/app/actions/pages";


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
            <div className="max-w-3xl mx-auto space-y-12 text-center">
                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">{page?.title || "Get in Touch"}</h1>
                    <p className="text-brand-cream/70 text-lg max-w-2xl mx-auto">
                        Have questions about your order or need style advice? Reach out to us directly through any of the channels below.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid gap-6">
                    {/* Email */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center hover:bg-white/10 transition-colors">
                        <div className="w-16 h-16 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center mb-4">
                            <Icon name="email" className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-cream mb-2">Email Us</h3>
                        <p className="text-brand-cream/60 mb-4">We'll respond within 24 hours</p>
                        <a
                            href={`mailto:${contactInfo.email}`}
                            className="text-2xl font-bold text-brand-primary hover:text-white transition-colors break-all"
                        >
                            {contactInfo.email}
                        </a>
                    </div>

                    {/* Phone/WhatsApp */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center hover:bg-white/10 transition-colors">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                            <Icon name="phone" className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-cream mb-2">Call or WhatsApp</h3>
                        <p className="text-brand-cream/60 mb-4">Sat-Thu from 10am to 10pm</p>
                        <a
                            href={`tel:${contactInfo.whatsapp}`}
                            className="text-2xl font-bold text-brand-primary hover:text-white transition-colors"
                        >
                            {contactInfo.whatsapp}
                        </a>
                    </div>

                    {/* Address */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center hover:bg-white/10 transition-colors">
                        <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-4">
                            <Icon name="location_on" className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-cream mb-2">Visit Us</h3>
                        <p className="text-brand-cream/60 mb-4">Come satisfy your fashion needs</p>
                        <p className="text-xl text-brand-cream whitespace-pre-line leading-relaxed">
                            {contactInfo.address}
                        </p>
                    </div>
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
