import type { Product, RentalCycle } from "@/lib/catalog";
import { productPrice } from "@/lib/pricing";
import { cycleLabel, formatMoney } from "@/lib/format";
import { Availability } from "./Availability";
import { ProductPhoto } from "./ProductPhoto";

// `group` lets the photo zoom on card hover without a descendant selector.
const cardBase =
  "group relative min-w-0 overflow-hidden border transition-[background-color,border-color,transform] duration-[180ms] ease-[ease] hover:-translate-y-[2px] hover:bg-shell max-lap:flex-[0_0_min(82vw,340px)] max-lap:snap-center max-tiny:basis-[87vw]";
const cardIdle = "border-transparent bg-shell/64";
const cardSelected = "border-ink bg-shell";

const controlBase =
  "absolute top-3 right-3 z-2 flex h-[35px] w-[35px] items-center justify-center rounded-full border font-mona text-[17px]";
const controlIdle = "border-line-strong bg-shell";
const controlSelected = "border-ink bg-lime";

export function ProductCard({
  product,
  cycle,
  location,
  selected,
  multiSelect,
  priority,
  onSelect,
  onOpenDetails,
}: {
  product: Product;
  cycle: RentalCycle;
  location: string;
  selected: boolean;
  /** Accessories are a checkbox set; desks and chairs are a radio group. */
  multiSelect: boolean;
  priority: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
}) {
  const compareAt = product.compareAtPrice;

  return (
    <article className={`${cardBase} ${selected ? cardSelected : cardIdle}`}>
      <button
        type="button"
        className="block w-full border-0 bg-transparent p-0 text-left"
        onClick={onSelect}
        role={multiSelect ? "checkbox" : "radio"}
        aria-checked={selected}
        aria-label={`${selected ? "Selected" : "Select"} ${product.name}`}
      >
        <div className="relative aspect-[1.45] overflow-hidden bg-[#f7f6f2] max-lap:aspect-[1.35]">
          <ProductPhoto
            product={product}
            priority={priority}
            className="group-hover:scale-[1.035]"
          />
          <span className="absolute bottom-[11px] left-[11px] flex items-center gap-1.5 bg-shell/84 px-2 py-1.5 font-mona text-[8px] font-[720] tracking-[0.07em] uppercase backdrop-blur-[10px]">
            <i aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#4f9b66]" />
            Scene matched
          </span>
          <div className="absolute top-3 left-3 z-2 flex gap-[5px]">
            {compareAt && (
              <span className="rounded-full bg-accent px-2 py-[5px] font-mona text-[9px] font-[750] text-white">
                -{Math.round((1 - product.weeklyPrice / compareAt) * 100)}%
              </span>
            )}
            {product.badge && (
              <span className="rounded-full bg-ink px-2 py-[5px] font-mona text-[9px] font-[750] text-white">
                {product.badge}
              </span>
            )}
          </div>
          <span className={`${controlBase} ${selected ? controlSelected : controlIdle}`}>
            {selected ? "✓" : "+"}
          </span>
        </div>
        <div className="px-[18px] pt-[19px] pb-4">
          <span className="block overflow-hidden font-mona text-[9px] font-[720] tracking-[0.09em] text-ellipsis whitespace-nowrap uppercase opacity-[0.52]">
            {product.brand} · {product.model}
          </span>
          <h3 className="my-[7px] font-mona text-[19px] leading-[1.05] tracking-[-0.035em]">
            {product.name}
          </h3>
          <p className="mt-0 mb-[13px] line-clamp-2 min-h-[33px] text-[11px] leading-[1.48] opacity-[0.58] max-lap:text-xs">
            {product.description}
          </p>
          <div className="mb-3 flex flex-wrap gap-[5px]">
            <span className="rounded-full border border-line px-[7px] py-[5px] text-[9px]">
              {product.dimensions}
            </span>
            <span className="rounded-full border border-line px-[7px] py-[5px] text-[9px]">
              {product.color}
            </span>
          </div>
          <Availability product={product} location={location} />
          <div className="mt-4 flex items-end justify-between border-t border-line pt-[14px]">
            <div>
              {compareAt && (
                <del className="block text-[9px] opacity-[0.42]">
                  {formatMoney(cycle === "weekly" ? compareAt : compareAt * 4)}
                </del>
              )}
              <strong className="font-mona text-[19px] tracking-[-0.035em]">
                {formatMoney(productPrice(product, cycle))}
              </strong>
              <small className="text-[9px] opacity-50">/{cycleLabel(cycle)}</small>
            </div>
            <span className="font-mona text-[9px] font-[750] uppercase">
              {selected ? "Selected" : "Add to room"}
            </span>
          </div>
        </div>
      </button>
      <button
        type="button"
        className="flex min-h-[44px] w-full items-center justify-between border-0 border-t border-t-line bg-transparent px-[18px] font-mona text-[10px] font-bold hover:bg-blue"
        onClick={onOpenDetails}
      >
        View details <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}
