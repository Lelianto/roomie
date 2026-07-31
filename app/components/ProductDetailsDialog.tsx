import type { RefObject } from "react";
import type { Product, RentalCycle } from "@/lib/catalog";
import { productPrice } from "@/lib/pricing";
import { cycleLabel, formatMoney } from "@/lib/format";
import { Availability } from "./Availability";
import { ProductPhoto } from "./ProductPhoto";
import { SheetDialog, SheetHeader } from "./ui/SheetDialog";

// The grid loses a divider at each edge: odd cells carry the vertical rule, the
// first row carries the horizontal one.
const specCell =
  "py-[18px] [&:nth-child(-n+2)]:border-b [&:nth-child(-n+2)]:border-line [&:nth-child(even)]:pl-[18px] [&:nth-child(odd)]:border-r [&:nth-child(odd)]:border-line [&:nth-child(odd)]:pr-4";
const specLabel = "mb-[5px] block text-[9px] tracking-[0.09em] uppercase opacity-50";
const specValue = "block font-mona text-xs";

export function ProductDetailsDialog({
  dialogRef,
  product,
  cycle,
  location,
  selected,
  onClose,
  onDismiss,
  onToggle,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  product: Product | null;
  cycle: RentalCycle;
  location: string;
  selected: boolean;
  /** Runs after the dialog has actually closed, to clear the shown product. */
  onClose: () => void;
  onDismiss: () => void;
  onToggle: () => void;
}) {
  const specs = product
    ? [
        { label: "Dimensions", value: product.dimensions },
        { label: "Finish", value: product.color },
        { label: "Condition", value: product.condition },
        { label: "Delivery", value: "Next day" },
      ]
    : [];

  return (
    <SheetDialog
      dialogRef={dialogRef}
      maxWidth="max-w-[1100px]"
      onClose={onClose}
      onDismiss={onDismiss}
    >
      {product && (
        <>
          <SheetHeader
            label="Product details"
            title={product.name}
            closeLabel="Close product details"
            onDismiss={onDismiss}
          />
          <div className="grid min-h-[calc(100%-78px)] grid-cols-[48%_1fr] max-lap:block">
            <div className="relative min-h-[680px] overflow-hidden bg-shell max-lap:min-h-[42dvh]">
              <ProductPhoto product={product} />
              <span className="absolute bottom-[25px] left-[25px] z-2 rounded-full bg-lime px-[11px] py-2 font-mona text-[10px] font-[750]">
                {product.condition} condition
              </span>
            </div>
            <div className="px-[45px] pt-[55px] pb-10 max-lap:px-5 max-lap:pt-[38px] max-lap:pb-[100px]">
              <p className="eyebrow mb-3">
                {product.brand} · {product.model}
              </p>
              <h2 className="mt-0 mb-6 font-mona text-[clamp(42px,5vw,68px)] leading-[0.92] tracking-[-0.065em] max-lap:text-[clamp(40px,13vw,58px)]">
                {product.name}
              </h2>
              <p className="mt-0 mb-[19px] max-w-[520px] text-sm leading-[1.65] opacity-[0.66]">
                {product.description}
              </p>
              <Availability product={product} location={location} />
              <div className="my-[34px] grid grid-cols-2 border-y border-line">
                {specs.map((spec) => (
                  <div key={spec.label} className={specCell}>
                    <span className={specLabel}>{spec.label}</span>
                    <strong className={specValue}>{spec.value}</strong>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-[25px] max-mob:grid-cols-1">
                <div>
                  <h3 className="mt-0 mb-[13px] font-mona text-[13px]">Under the hood</h3>
                  <ul className="m-0 list-none p-0">
                    {product.features.map((feature) => (
                      <li
                        key={feature}
                        className="border-t border-line py-2.5 text-[11px] leading-[1.45] before:mr-2 before:text-green before:content-['✓']"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mt-0 mb-[13px] font-mona text-[13px]">
                    What&apos;s included
                  </h3>
                  <ul className="m-0 list-none p-0">
                    {product.included.map((item) => (
                      <li
                        key={item}
                        className="border-t border-line py-2.5 text-[11px] leading-[1.45] before:mr-2 before:text-green before:content-['✓']"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-[30px] flex items-center justify-between bg-ink py-[14px] pr-[14px] pl-5 text-white max-lap:fixed max-lap:bottom-0 max-lap:z-[25] max-lap:m-0 max-lap:w-full max-lap:pb-[calc(14px+env(safe-area-inset-bottom))]">
                <div>
                  <strong className="font-mona text-[26px]">
                    {formatMoney(productPrice(product, cycle))}
                  </strong>
                  <span className="text-[10px] opacity-50">/{cycleLabel(cycle)}</span>
                </div>
                <button
                  type="button"
                  className="min-h-[48px] border-0 bg-lime px-[18px] font-mona text-[10px] font-[750] text-ink"
                  onClick={onToggle}
                >
                  {selected ? "Remove from setup" : "Add to setup"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </SheetDialog>
  );
}
