"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProductImageUpload } from "@/components/admin/products/ProductImageUpload";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<{ url: string; is_primary: boolean }[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: "",
    category_id: "",
    is_active: true,
    is_featured: false,
  });

  // Variant management
  const [variants, setVariants] = useState<{
    size_id: string;
    size_name: string;
    sku: string;
    price_adjustment: number;
    stock_quantity: number;
  }[]>([]);
  const [sizes, setSizes] = useState<{ id: string; name: string }[]>([]);

  // Fetch all collections and sizes on component mount
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");

      if (!collectionsError && collectionsData) {
        setCollections(collectionsData);
      }

      // Fetch sizes
      const { data: sizesData, error: sizesError } = await supabase
        .from("sizes")
        .select("id, name")
        .order("name");

      if (!sizesError && sizesData) {
        setSizes(sizesData);
      }
    }
    fetchData();
  }, []);

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

      // Insert product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          base_price: parseFloat(formData.base_price),
          category_id: formData.category_id || null,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert product images
      const imageRecords = images.map(img => ({
        product_id: product.id,
        url: img.url,
        is_primary: img.is_primary,
        alt_text: formData.name,
      }));

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imageRecords);

      if (imagesError) throw imagesError;

      // Insert product-collection relationships
      if (selectedCollections.length > 0) {
        const collectionRecords = selectedCollections.map(collectionId => ({
          product_id: product.id,
          collection_id: collectionId,
        }));

        const { error: collectionsError } = await supabase
          .from("product_collections")
          .insert(collectionRecords);

        if (collectionsError) throw collectionsError;
      }

      // Insert variants
      if (variants.length > 0) {
        const variantRecords = variants.map(v => ({
          product_id: product.id,
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

      // Redirect to products list
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Error creating product:", err);
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-2 text-gray-600">
          Create a new product for your store
        </p>
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
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="Describe your product..."
          />
        </div>

        {/* Base Price */}
        <div>
          <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
            Base Price (EGP) *
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
          <p className="mt-1 text-xs text-gray-500">
            Leave empty if no category. You'll be able to select from dropdown once categories management is added.
          </p>
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
                          selectedCollections.filter((id) => id !== collection.id)
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
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
