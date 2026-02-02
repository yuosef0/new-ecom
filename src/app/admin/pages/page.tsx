import { getPages } from "@/app/actions/pages";
import Link from "next/link";

export default async function AdminPagesList() {
    const pages = await getPages();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Static Pages</h1>
                <p className="mt-2 text-gray-600">
                    Manage content for storefront pages like About, Privacy, Shipping, etc.
                </p>
            </div>

            {/* Pages Grid */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-outlined text-brand-primary">description</span>
                        <h2 className="text-lg font-semibold text-gray-900">All Pages ({pages.length})</h2>
                    </div>
                </div>

                {pages.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                        <span className="material-icons-outlined text-5xl text-gray-300 mb-4">description</span>
                        <p className="text-sm">No pages found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-outlined text-sm">title</span>
                                            Page Title
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-outlined text-sm">link</span>
                                            Slug
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-outlined text-sm">schedule</span>
                                            Last Updated
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {pages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                                    <span className="material-icons-outlined text-brand-primary text-xl">description</span>
                                                </div>
                                                <div className="font-medium text-gray-900">{page.title}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md font-mono">
                                                /{page.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span className="material-icons-outlined text-sm">calendar_today</span>
                                                {new Date(page.updated_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/pages/${page.slug}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-dark rounded-lg transition-all shadow-sm hover:shadow-md"
                                            >
                                                <span className="material-icons-outlined text-lg">edit</span>
                                                Edit Page
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
