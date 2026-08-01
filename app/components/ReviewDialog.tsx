import type { FormEvent, RefObject } from "react";
import type { Bundle, Product, RentalCycle } from "@/lib/catalog";
import { productPrice, type DeliveryType } from "@/lib/pricing";
import { cycleLabel, formatMoney } from "@/lib/format";
import { LOCATIONS } from "@/lib/constants";
import { DateField } from "./ui/DateField";
import { SelectField } from "./ui/SelectField";
import { fieldLabel, fieldWrap } from "./ui/field";
import { ProductPhoto } from "./ProductPhoto";
import { SheetDialog, SheetHeader } from "./ui/SheetDialog";

const lineItem =
  "grid min-h-[103px] grid-cols-[78px_1fr_auto_44px] items-center gap-[15px] border-t border-line max-lap:grid-cols-[64px_1fr_auto_44px] max-tiny:grid-cols-[54px_1fr_auto] max-tiny:gap-2.5 max-tiny:py-3";

const deliveryOption =
  "grid min-h-[70px] grid-cols-[auto_1fr_auto] items-center gap-3 border px-[13px] py-2.5 [&+&]:mt-[7px]";
const deliveryIdle = "border-transparent bg-shell/62";
const deliveryChosen = "border-ink bg-shell";

const summaryRow = "flex items-center justify-between py-[7px] text-[11px]";
const summaryValue = "font-mona text-[11px]";

export type ReviewDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  products: Product[];
  cycle: RentalCycle;
  activeBundle: Bundle | undefined;
  subtotal: number;
  discount: number;
  total: number;
  deliveryFee: number;
  orderTotal: number;
  location: string;
  onLocationChange: (value: string) => void;
  deliveryDate: string;
  minDeliveryDate: string;
  onDeliveryDateChange: (value: string) => void;
  deliveryType: DeliveryType;
  onDeliveryTypeChange: (value: DeliveryType) => void;
  address: string;
  addressError: string;
  onAddressChange: (value: string) => void;
  isConfirmed: boolean;
  reference: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveProduct: (product: Product) => void;
  onEditSetup: () => void;
  onDismiss: () => void;
};

export function ReviewDialog({
  dialogRef,
  products,
  cycle,
  activeBundle,
  subtotal,
  discount,
  total,
  deliveryFee,
  orderTotal,
  location,
  onLocationChange,
  deliveryDate,
  minDeliveryDate,
  onDeliveryDateChange,
  deliveryType,
  onDeliveryTypeChange,
  address,
  addressError,
  onAddressChange,
  isConfirmed,
  reference,
  onSubmit,
  onRemoveProduct,
  onEditSetup,
  onDismiss,
}: ReviewDialogProps) {
  const deliveryChoices = [
    {
      id: "regular" as const,
      name: "Roomie Setup",
      note: "Next day · delivery and assembly included",
      price: "Free",
    },
    {
      id: "priority" as const,
      name: "Priority Setup",
      note: "Choose a 2-hour window · live tracking",
      price: "$5",
    },
  ];

  return (
    <SheetDialog dialogRef={dialogRef} onDismiss={onDismiss}>
      <>
        <SheetHeader
          label={isConfirmed ? "Request received" : "Review your room"}
          title={
            isConfirmed
              ? "You’re ready to work."
              : `${products.length} pieces · ${location}`
          }
          closeLabel="Close review"
          onDismiss={onDismiss}
        />

        {isConfirmed ? (
          <div className="flex min-h-[calc(100%-78px)] flex-col items-center px-[30px] py-[95px] text-center max-lap:px-5 max-lap:pt-[75px] max-lap:pb-[calc(50px+env(safe-area-inset-bottom))]">
            <span
              aria-hidden="true"
              className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-lime font-mona text-[27px]"
            >
              ✓
            </span>
            <p className="eyebrow mt-[27px] mb-[15px]">Demo request confirmed</p>
            <h2 className="m-0 font-mona text-[clamp(43px,6vw,76px)] leading-[0.93] tracking-[-0.067em]">
              Your workspace is taking shape.
            </h2>
            <p className="mt-6 mb-0 max-w-[540px] text-sm leading-[1.6] opacity-60">
              We&apos;ve reserved these demo items for {deliveryDate}. In a live
              version, this request would now be sent to the operations team to
              schedule delivery and assembly.
            </p>
            <div className="mt-8 mb-0 border border-line-strong px-[22px] py-[13px]">
              <span className="mb-1 block text-[8px] tracking-[0.1em] uppercase opacity-50">
                Reference
              </span>
              <strong className="block font-mona text-[13px]">{reference}</strong>
            </div>
            <button
              type="button"
              className="mt-[30px] min-h-[49px] border-0 bg-accent px-5 font-mona text-[11px] font-[750] text-white"
              onClick={onDismiss}
            >
              Back to your workspace
            </button>
          </div>
        ) : (
          <form
            className="grid min-h-[calc(100%-78px)] grid-cols-[53%_1fr] max-lap:block"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="border-r border-line px-[35px] py-10 max-lap:border-r-0 max-lap:border-b max-lap:border-line max-lap:px-5 max-lap:py-[30px]">
              <p className="eyebrow mb-5">Your equipment</p>
              {products.map((product) => (
                <article key={product.id} className={lineItem}>
                  <div className="relative h-[72px] w-[72px] bg-shell max-lap:h-[60px] max-lap:w-[60px] max-tiny:h-[50px] max-tiny:w-[50px]">
                    <ProductPhoto product={product} />
                  </div>
                  <div>
                    <span className="mb-[5px] block font-mona text-[8px] tracking-[0.09em] uppercase opacity-[0.48]">
                      {product.brand} · {product.category}
                    </span>
                    <strong className="block font-mona text-sm">{product.name}</strong>
                    <small className="mt-[5px] block text-[9px] opacity-50">
                      {product.condition} · {product.color}
                    </small>
                  </div>
                  <b className="font-mona text-[13px] max-tiny:col-start-3">
                    {formatMoney(productPrice(product, cycle))}
                  </b>
                  {product.category === "accessory" && (
                    <button
                      type="button"
                      className="h-11 w-11 border-0 bg-transparent text-[22px] opacity-[0.48] max-tiny:col-start-3 max-tiny:row-start-2 max-tiny:justify-self-end"
                      onClick={() => onRemoveProduct(product)}
                      aria-label={`Remove ${product.name}`}
                    >
                      ×
                    </button>
                  )}
                </article>
              ))}
              <button
                type="button"
                className="mt-[22px] min-h-[46px] border border-line-strong bg-transparent px-4 font-mona text-[11px] font-bold"
                onClick={onEditSetup}
              >
                + Edit your setup
              </button>
            </div>

            <div className="bg-paper-deep px-[35px] py-10 max-lap:px-5 max-lap:pt-[35px] max-lap:pb-[calc(35px+env(safe-area-inset-bottom))]">
              <p className="eyebrow mb-5">Delivery details</p>
              <div className="grid grid-cols-2 gap-[11px] max-mob:grid-cols-1">
                <SelectField
                  label="Location"
                  value={location}
                  options={LOCATIONS}
                  onChange={onLocationChange}
                />
                <DateField
                  label="Delivery date"
                  value={deliveryDate}
                  min={minDeliveryDate}
                  onChange={onDeliveryDateChange}
                />
                <label className={`${fieldWrap.boxed} col-span-full`}>
                  <span className={fieldLabel}>Delivery address</span>
                  <textarea
                    className="min-h-[70px] w-full resize-y border-0 bg-transparent p-0 pt-2 text-xs outline-0"
                    value={address}
                    aria-invalid={addressError ? true : undefined}
                    onChange={(event) => onAddressChange(event.target.value)}
                    placeholder="Villa, hotel, office, or coworking address"
                  />
                  {addressError && (
                    <em className="block pb-1 text-[11px] not-italic text-danger">
                      {addressError}
                    </em>
                  )}
                </label>
              </div>

              <fieldset className="mt-[29px] mb-0 border-0 p-0">
                <legend className="mb-[11px] font-mona text-[10px] font-[750] tracking-[0.09em] uppercase">
                  Delivery service
                </legend>
                {deliveryChoices.map((choice) => (
                  <label
                    key={choice.id}
                    className={`${deliveryOption} ${
                      deliveryType === choice.id ? deliveryChosen : deliveryIdle
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      className="h-[18px] w-[18px] accent-ink"
                      checked={deliveryType === choice.id}
                      onChange={() => onDeliveryTypeChange(choice.id)}
                    />
                    <span>
                      <strong className="block font-mona text-xs">{choice.name}</strong>
                      <small className="mt-1 block text-[9px] leading-[1.4] opacity-50">
                        {choice.note}
                      </small>
                    </span>
                    <b className="font-mona text-[11px]">{choice.price}</b>
                  </label>
                ))}
              </fieldset>

              <div className="mt-7 border-y border-line pt-[17px] pb-2.5">
                <div className={summaryRow}>
                  <span>Equipment subtotal</span>
                  <b className={summaryValue}>{formatMoney(subtotal)}</b>
                </div>
                {discount > 0 && (
                  <div className={`${summaryRow} text-green`}>
                    <span>{activeBundle?.name} saving</span>
                    <b className={summaryValue}>-{formatMoney(discount)}</b>
                  </div>
                )}
                <div className={summaryRow}>
                  <span>Delivery &amp; assembly</span>
                  <b className={summaryValue}>
                    {deliveryFee ? formatMoney(deliveryFee) : "Included"}
                  </b>
                </div>
                <div className={`${summaryRow} mt-[9px] border-t border-line pt-[17px]`}>
                  <span>
                    Due today
                    <small className="mt-[3px] block text-[9px] opacity-55">
                      Then {formatMoney(total)}/{cycleLabel(cycle)}
                    </small>
                  </span>
                  <b className="font-mona text-2xl">{formatMoney(orderTotal)}</b>
                </div>
              </div>

              <button
                className="mt-[18px] min-h-[54px] w-full border-0 bg-ink px-[19px] font-mona text-xs font-[750] text-white"
                type="submit"
              >
                Confirm demo rental{" "}
                <span aria-hidden="true" className="float-right">
                  →
                </span>
              </button>
              <p className="mt-2.5 mb-0 text-center text-[9px] leading-[1.5] opacity-[0.48]">
                Demo only — no payment is collected and no external request is sent.
              </p>
            </div>
          </form>
        )}
      </>
    </SheetDialog>
  );
}
