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
  className = "",
}: {
  product: Product;
  priority?: boolean;
  /** Extra utilities, e.g. the catalog card's hover zoom. */
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image}
      alt={product.name}
      width={1200}
      height={1200}
      className={`h-full w-full object-contain transition-transform duration-[260ms] ease-[ease] ${className}`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
