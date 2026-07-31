import type { Product } from "@/lib/catalog";

export function Availability({
  product,
  location,
}: {
  product: Product;
  location: string;
}) {
  return (
    <span className="flex items-center gap-1.5 font-mona text-[10px] font-bold text-green">
      <i
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-[#3d9b65] shadow-[0_0_0_3px_rgba(61,155,101,0.14)]"
      />
      {product.stock} available in {location}
    </span>
  );
}
