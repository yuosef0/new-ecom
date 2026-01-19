import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

async function getProducts() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      base_price,
      is_active,
      is_featured,
      created_at,
      categories(name),
      product_images!inner(url, is_primary)
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return products;
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">
            Manage your product inventory
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          <span className="material-icons-outlined">add</span>
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {products.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <span className="material-icons-outlined text-4xl text-gray-300 mb-2">
              inventory_2
            </span>
            <p>No products yet</p>
            <Link
              href="/admin/products/new"
              className="mt-4 inline-block text-brand-primary hover:underline"
            >
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product: any) => {
                  const primaryImage = product.product_images?.find(
                    (img: any) => img.is_primary
                  )?.url || product.product_images?.[0]?.url;

                  return (
                    <tr key={product.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {primaryImage && (
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.categories?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.base_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full w-fit ${
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                          {product.is_featured && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 w-fit">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-brand-primary hover:text-brand-dark"
                          >
                            Edit
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
