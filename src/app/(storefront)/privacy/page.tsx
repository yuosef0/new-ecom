import { getPage } from "@/app/actions/pages";
import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";
import { notFound } from "next/navigation";

export async function generateMetadata() {
    const page = await getPage('privacy');
    return {
        title: `${page?.title || 'Privacy Policy'} | RiLIKS`,
        description: "Read our privacy policy and how we handle your data.",
    };
}

export default async function PrivacyPage() {
    const page = await getPage('privacy');

    if (!page) notFound();

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">{page.title}</h1>
                    <p className="text-xl text-brand-cream/70 max-w-2xl mx-auto">
                        Your privacy is important to us.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-brand-cream/80"
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                />

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
