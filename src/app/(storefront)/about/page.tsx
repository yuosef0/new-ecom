import { getPage } from "@/app/actions/pages";
import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";
import { notFound } from "next/navigation";

export async function generateMetadata() {
    const page = await getPage('about');
    return {
        title: `${page?.title || 'About Us'} | RiLIKS`,
        description: "Learn about RiLIKS story, mission, and commitment to premium fashion.",
    };
}

export default async function AboutPage() {
    const page = await getPage('about');

    if (!page) notFound();

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">{page.title}</h1>
                </div>

                {/* Content */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-brand-cream/80 space-y-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                />

                {/* Values Grid - Kept hardcoded as it's layout specific */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                            <Icon name="diamond" className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-cream">Premium Quality</h3>
                        <p className="text-brand-cream/60 text-sm">
                            We never compromise on materials. From breathable cottons to durable blends, quality is our signature.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                            <Icon name="local_shipping" className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-cream">Fast Delivery</h3>
                        <p className="text-brand-cream/60 text-sm">
                            We know you want your style ASAP. Our logistics network ensures quick and reliable delivery across Egypt.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                            <Icon name="support_agent" className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-cream">Customer First</h3>
                        <p className="text-brand-cream/60 text-sm">
                            Your satisfaction is our priority. Our support team is always ready to assist with any inquiries.
                        </p>
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

