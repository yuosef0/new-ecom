"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProductImageUpload } from "@/components/admin/products/ProductImageUpload";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<{ url: string; is_primary: boolean }[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: "",
    compare_at_price: "",
    category_id: "",
    is_active: true,
    is_featured: false,
  });

  // Variant management
  const [variants, setVariants] = useState<{
    id?: string;
    size_id: string;
    size_name: string;
    sku: string;
    price_adjustment: number;
    stock_quantity: number;
  }[]>([]);
  const [sizes, setSizes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadProduct();
    loadCollections();
    loadSizes();
  }, [id]);

  const loadSizes = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sizes")
      .select("id, name")
      .order("name");

    if (!error && data) {
      setSizes(data);
    }
  };

  const loadCollections = async () => {
    const supabase = createClient();

    // Fetch all available collections
    const { data: allCollections, error: collectionsError } = await supabase
      .from("collections")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name");

    if (!collectionsError && allCollections) {
      setCollections(allCollections);
    }

    // Fetch product's current collections
    const { data: productCollections, error: prodCollError } = await supabase
      .from("product_collections")
      .select("collection_id")
      .eq("product_id", id);

    if (!prodCollError && productCollections) {
      setSelectedCollections(productCollections.map((pc: any) => pc.collection_id));
    }
  };

  const loadProduct = async () => {
    try {
      const supabase = createClient();

      const { data: product, error: productError } = await supabase
        .from("products")
        .select(`
          *,
          product_images(url, is_primary)
        `)
        .eq("id", id)
        .single();

      if (productError) throw productError;

      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        base_price: product.base_price.toString(),
        compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : "",
        category_id: product.category_id || "",
        is_active: product.is_active,
        is_featured: product.is_featured || false,
      });

      if (product.product_images) {
        setImages(product.product_images.map((img: any) => ({
          url: img.url,
          is_primary: img.is_primary,
        })));
      }

      // Load variants
      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select(`
          id,
          sku,
          price_adjustment,
          stock_quantity,
          size_id,
          sizes(id, name)
        `)
        .eq("product_id", id);

      if (!variantsError && variantsData) {
        setVariants(variantsData.map((v: any) => ({
          id: v.id,
          size_id: v.size_id,
          size_name: v.sizes?.name || "",
          sku: v.sku || "",
          price_adjustment: v.price_adjustment || 0,
          stock_quantity: v.stock_quantity || 0,
        })));
      }
    } catch (err: any) {
      console.error("Error loading product:", err);
      setError(err.message || "Failed to load product");
    } finally {
      setProductLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setError("Please upload at least one product image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          base_price: parseFloat(formData.base_price),
          compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
          category_id: formData.category_id || null,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (productError) throw productError;

      // Delete old images
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", id);

      // Insert new images
      const imageRecords = images.map(img => ({
        product_id: id,
        url: img.url,
        is_primary: img.is_primary,
        alt_text: formData.name,
      }));

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imageRecords);

      if (imagesError) throw imagesError;

      // Update product-collection relationships
      // First, delete existing relationships
      await supabase
        .from("product_collections")
        .delete()
        .eq("product_id", id);

      // Then, insert new relationships
      if (selectedCollections.length > 0) {
        const collectionRecords = selectedCollections.map(collectionId => ({
          product_id: id,
          collection_id: collectionId,
        }));

        const { error: collectionsError } = await supabase
          .from("product_collections")
          .insert(collectionRecords);

        if (collectionsError) throw collectionsError;
      }

      // Update variants
      // Delete old variants
      await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", id);

      // Insert new variants
      if (variants.length > 0) {
        const variantRecords = variants.map(v => ({
          product_id: id,
          size_id: v.size_id,
          sku: v.sku || null,
          price_adjustment: v.price_adjustment || 0,
          stock_quantity: v.stock_quantity || 0,
        }));

        const { error: variantsError } = await supabase
          .from("product_variants")
          .insert(variantRecords);

        if (variantsError) throw variantsError;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Error updating product:", err);
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const supabase = createClient();

      // Delete product (images will be deleted via CASCADE)
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      setError(err.message || "Failed to delete product");
      setDeleting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  if (productLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/products"
            className="text-sm text-brand-primary hover:underline mb-2 inline-block"
          >
            ← Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-2 text-gray-600">Update product information</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className="material-icons-outlined text-lg">delete</span>
          {deleting ? "Deleting..." : "Delete Product"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData({
                ...formData,
                name: e.target.value,
                slug: generateSlug(e.target.value),
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="Enter product name"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL) *
          </label>
          <input
            type="text"
            id="slug"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="product-slug"
          />
          <p className="mt-1 text-xs text-gray-500">
            Auto-generated from name. URL-friendly identifier.
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="Describe your product..."
          />
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base Price */}
          <div>
            <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
              سعر البيع (ج.م) * <span className="text-gray-400 font-normal">- Sale Price</span>
            </label>
            <input
              type="number"
              id="base_price"
              required
              min="0"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Compare at Price */}
          <div>
            <label htmlFor="compare_at_price" className="block text-sm font-medium text-gray-700 mb-2">
              السعر قبل الخصم (ج.م) <span className="text-gray-400 font-normal">- Compare at Price</span>
            </label>
            <input
              type="number"
              id="compare_at_price"
              min="0"
              step="0.01"
              value={formData.compare_at_price}
              onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="اختياري - اتركه فارغ إذا لم يكن هناك خصم"
            />
            <p className="mt-1 text-xs text-gray-500">
              إذا كان أعلى من سعر البيع، سيظهر الخصم على كارد المنتج
            </p>
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            Category (Optional)
          </label>
          <input
            type="text"
            id="category_id"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="Category ID"
          />
        </div>

        {/* Status Toggles */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Active (visible in store)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
              Featured product
            </label>
          </div>
        </div>

        {/* Collections Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Collections (Optional)
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
            {collections.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No collections available</p>
            ) : (
              collections.map((collection) => (
                <div key={collection.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`collection-${collection.id}`}
                    checked={selectedCollections.includes(collection.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCollections([...selectedCollections, collection.id]);
                      } else {
                        setSelectedCollections(
                          selectedCollections.filter((cid) => cid !== collection.id)
                        );
                      }
                    }}
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <label
                    htmlFor={`collection-${collection.id}`}
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {collection.name}
                  </label>
                </div>
              ))
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Select one or more collections this product belongs to
          </p>
        </div>

        {/* Product Variants (Sizes & Stock) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Product Variants (Sizes & Stock)
          </label>
          <div className="space-y-3 border border-gray-300 rounded-lg p-4">
            {variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-4 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Size *
                  </label>
                  <select
                    value={variant.size_id}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      const selectedSize = sizes.find(s => s.id === e.target.value);
                      newVariants[index] = {
                        ...variant,
                        size_id: e.target.value,
                        size_name: selectedSize?.name || "",
                      };
                      setVariants(newVariants);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select size</option>
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].sku = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                    placeholder="SKU"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock_quantity}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].stock_quantity = parseInt(e.target.value) || 0;
                      setVariants(newVariants);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setVariants(variants.filter((_, i) => i !== index));
                    }}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setVariants([
                  ...variants,
                  {
                    size_id: "",
                    size_name: "",
                    sku: "",
                    price_adjustment: 0,
                    stock_quantity: 0,
                  },
                ]);
              }}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-brand-primary hover:text-brand-primary transition-colors text-sm font-medium"
            >
              + Add Variant
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Add different sizes with their stock quantities. Leave empty if product has no size variations.
          </p>
        </div>

        {/* Product Images Upload */}
        <ProductImageUpload
          onImagesUploaded={setImages}
          productId={id}
          existingImages={images}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || deleting}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-block"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
