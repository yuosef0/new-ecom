import { getPage } from "@/app/actions/pages";
import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";
import { notFound } from "next/navigation";

export async function generateMetadata() {
    const page = await getPage('returns');
    return {
        title: `${page?.title || 'Return & Exchange'} | RiLIKS`,
        description: "Learn about our return and exchange policy.",
    };
}

export default async function ReturnsPage() {
    const page = await getPage('returns');

    if (!page) notFound();

    return (
        <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-brand-cream">{page.title}</h1>
                </div>

                {/* Content */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 prose prose-invert max-w-none text-brand-cream/80 space-y-8"
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                />

                {/* Non-returnable items - Hardcoded for better UI, or could move to DB if user insists */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                        <Icon name="warning" className="text-xl" />
                        Non-returnable Items
                    </h3>
                    <ul className="list-disc list-inside text-brand-cream/70 space-y-1 ml-1">
                        <li>Accessories (Jewelry, Scarves, etc.) for hygiene reasons.</li>
                        <li>Underwear and Swimwear.</li>
                        <li>Items marked as "Final Sale".</li>
                    </ul>
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



