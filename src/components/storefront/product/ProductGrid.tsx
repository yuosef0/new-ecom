import { ProductCard } from "./ProductCard";
import type { ProductWithImages } from "@/lib/queries/products";

interface ProductGridProps {
  products: ProductWithImages[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
