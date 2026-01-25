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
      product_images(url, is_primary),
      product_variants(stock_quantity)
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Calculate total stock for each product
  return (products || []).map((product: any) => ({
    ...product,
    total_stock: product.product_variants?.reduce(
      (sum: number, v: any) => sum + (v.stock_quantity || 0),
      0
    ) || 0,
  }));
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Manage your product inventory
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors w-full sm:w-auto"
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
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product: any) => {
                  const primaryImage = product.product_images?.find(
                    (img: any) => img.is_primary
                  )?.url || product.product_images?.[0]?.url;

                  const isLowStock = product.total_stock > 0 && product.total_stock <= 5;
                  const isOutOfStock = product.total_stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-100">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {primaryImage && (
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 hidden sm:block">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                        {product.categories?.name || "-"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.base_price)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full ${isOutOfStock
                              ? "bg-red-100 text-red-800"
                              : isLowStock
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                        >
                          {isOutOfStock && (
                            <span className="material-icons-outlined text-sm">error</span>
                          )}
                          {isLowStock && (
                            <span className="material-icons-outlined text-sm">warning</span>
                          )}
                          {product.total_stock}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full w-fit ${product.is_active
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
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-brand-primary hover:text-brand-dark"
                          >
                            Edit
                          </Link>
                          <span className="text-gray-300 hidden sm:inline">|</span>
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-900 hidden sm:inline"
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
