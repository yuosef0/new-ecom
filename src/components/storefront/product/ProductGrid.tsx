import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  primary_image?: string | null;
  in_stock?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onQuickAdd?: (productId: string) => void;
}

export function ProductGrid({ products, onQuickAdd }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-cream/70 text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickAdd={() => onQuickAdd?.(product.id)}
        />
      ))}
    </div>
  );
}
