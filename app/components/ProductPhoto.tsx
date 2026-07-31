import type { Product } from "@/lib/catalog";

/**
 * Product art is pre-rendered at a fixed size and always displayed inside a
 * fixed box, so `next/image` has nothing to optimise here. The intrinsic
 * dimensions are declared so the browser reserves the right space before the
 * file arrives.
 */
export function ProductPhoto({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image}
      alt={product.name}
      width={1200}
      height={1200}
      className="product-photo"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
