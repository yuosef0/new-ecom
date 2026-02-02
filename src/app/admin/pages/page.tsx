import { getPages } from "@/app/actions/pages";
import Link from "next/link";
import { Icon } from "@/components/storefront/ui/Icon";

export default async function AdminPagesList() {
    const pages = await getPages();

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Static Pages</h1>
                    <p className="text-gray-500">Manage content for storefront pages.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Page Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Slug</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{page.title}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">/{page.slug}</td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/admin/pages/${page.slug}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors"
                                    >
                                        <Icon name="edit" className="text-sm" />
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
