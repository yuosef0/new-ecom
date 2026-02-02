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

            {/* Pages Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">All Pages ({pages.length})</h2>
                </div>

                {pages.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                        <span className="material-icons-outlined text-5xl text-gray-300 mb-4">description</span>
                        <p>No pages found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Page Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {pages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{page.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(page.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/pages/${page.slug}`}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-dark rounded-lg transition-colors"
                                            >
                                                <span className="material-icons-outlined text-sm">edit</span>
                                                Edit
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
