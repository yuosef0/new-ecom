import { Icon } from "@/components/storefront/ui/Icon";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | DXLR",
    description: "Read our privacy policy and how we handle your data.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">Privacy Policy</h1>
                    <p className="text-xl text-brand-cream/70 max-w-2xl mx-auto">
                        Your privacy is important to us.
                    </p>
                    <p className="text-sm text-brand-cream/50">
                        Last Updated: January 2024
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-brand-cream/80">
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-brand-primary mb-4">1. Introduction</h2>
                        <p>
                            DXLR ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-brand-primary mb-4">2. Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-brand-primary mb-4">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., delivering your order).</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-brand-primary mb-4">4. Data Security</h2>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-brand-primary mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:privacy@dxlr.com" className="text-brand-primary hover:underline">privacy@dxlr.com</a>
                        </p>
                    </section>
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
