"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface ProductImageUploadProps {
  onImagesUploaded: (imageUrls: { url: string; is_primary: boolean }[]) => void;
  productId?: string;
  existingImages?: { url: string; is_primary: boolean }[];
}

export function ProductImageUpload({
  onImagesUploaded,
  productId,
  existingImages = []
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<{ url: string; is_primary: boolean }[]>(existingImages);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const supabase = createClient();
      const uploadedUrls: { url: string; is_primary: boolean }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedUrls.push({
          url: publicUrl,
          is_primary: images.length === 0 && i === 0, // First image is primary if no existing images
        });
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesUploaded(newImages);
    } catch (err: any) {
      console.error("Error uploading images:", err);
      setError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If removed image was primary, make first image primary
    if (images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="material-icons-outlined text-gray-600">
              add_photo_alternate
            </span>
            <span className="text-sm text-gray-700">
              {uploading ? "Uploading..." : "Add Images"}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500">
            Upload multiple images. Click to select from your device.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Images Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-lg border-2 border-gray-200 overflow-hidden"
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Primary Badge */}
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-brand-primary text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}

              {/* Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.is_primary && (
                  <button
                    onClick={() => setPrimaryImage(index)}
                    className="px-3 py-1 bg-white text-gray-900 text-xs rounded hover:bg-gray-100"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  onClick={() => removeImage(index)}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <span className="material-icons-outlined text-gray-400 text-5xl mb-2">
            image
          </span>
          <p className="text-sm text-gray-600">No images uploaded yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Upload at least one image for your product
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> The first image will be set as primary by default. You can change this by clicking "Set Primary" on any other image.
        </p>
      </div>
    </div>
  );
}
