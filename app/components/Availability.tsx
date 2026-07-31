import type { Product } from "@/lib/catalog";

export function Availability({
  product,
  location,
}: {
  product: Product;
  location: string;
}) {
  return (
    <span className="availability">
      <i aria-hidden="true" />
      {product.stock} available in {location}
    </span>
  );
}
