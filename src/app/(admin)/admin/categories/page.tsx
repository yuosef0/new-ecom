import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return categories;
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">
            Manage product categories
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-500">
            <span className="material-icons-outlined text-4xl text-gray-300 mb-2">
              category
            </span>
            <p>No categories yet</p>
          </div>
        ) : (
          categories.map((category: any) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    category.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
              )}

              <div className="text-xs text-gray-500">
                Slug: {category.slug}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note about adding categories */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="material-icons-outlined text-blue-600 text-lg">info</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Managing Categories</p>
            <p>
              For now, categories can be added via Supabase dashboard. A full category
              management interface (add, edit, delete) will be added in the next update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
